const { executeQuery, createQueryBuilder, withTransaction, updateQueryBuilder } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");
const { getApplication } = require("./applicationController");
const { STATE_OPEN, STATE_CLOSED, STATE_DOING, STATE_DONE, STATE_TODO } = require("../util/enums");
const sendEmail = require("../util/emailService");

exports.createTask = async function (req, res) {
  // subject to many, many changes down the line. task creator to be passed down from the frontend
  const { task_name, task_description, task_plan, task_creator, task_owner } = req.body;
  const { acronym } = req.params;
  // get the app and the running number
  const app = await getApplication(acronym);
  const oldRNumber = app[0].App_Rnumber;
  const task_id = `${acronym}_${oldRNumber}`;
  const task_app_acronym = acronym;

  const task_state = STATE_OPEN;
  const columnsArray = ["task_id", "task_name", "task_description", "task_notes", "task_plan", "task_app_acronym", "task_state", "task_creator", "task_owner"];
  const date = new Date();

  const localeTime = date.toLocaleTimeString();

  let anyEmptyFields = false;
  // system generate task notes
  // type is 0 for system generated, 1 for user generated
  const task_notes = [{ text: "CREATE >> OPEN", date_posted: localeTime, creator: process.env.SYSTEM_USER, type: 0 }];
  const argsArray = [task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner];
  // validation
  const mandatoryFields = ["task_name", "task_creator"];
  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    if (isValueEmpty(req.body[field])) {
      res.status(400).json({ message: `${field} must not be empty` });
      anyEmptyFields = true;
      break;
    }
  }
  if (anyEmptyFields) {
    return;
  }

  if (task_name.length === 0 || task_name.length > 50) {
    res.status(400).json({ message: "Task name must be between 1 and 50 characters inclusive" });
    return;
  }

  const query = createQueryBuilder("task", columnsArray);
  const newRNumber = oldRNumber + 1;
  try {
    await withTransaction(async (connection) => {
      const incrementQuery = "UPDATE application SET App_Rnumber = ? WHERE (App_Acronym = ?);";
      // increment the running number. by incrementing after the task_id is generated, we ensure that the first task created will be the number specified by the user
      await connection.execute(incrementQuery, [newRNumber, acronym]);
      await connection.execute(query, argsArray);
    });
    res.send("Task successfully created");
  } catch (err) {
    res.status(err.code || 500).json({ message: "Error creating task: " + err.message });
  }
};

exports.getTasksForApp = async function (req, res) {
  // the app will be in the params
  const { acronym } = req.params;
  const query = "SELECT * FROM task WHERE (task_app_acronym=?)";
  try {
    const result = await executeQuery(query, [acronym]);
    // format the result here before sending to frontend - probably don't want to be sending everything
    result.map((task) => {
      const formattedNotes = JSON.parse(task.Task_notes);
      task["Task_notes"] = formattedNotes;
    });
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting tasks" + err.message });
  }
};

exports.updateTask = async function (req, res) {
  // the only updatable fields are plan and notes, and each field is optional. But in the way I am designing the frontend, the plan will always be sent over.
  // the notes will just be a string, but we do need information about who is creating the note which has to be taken from the frontend.

  const { taskID } = req.params;
  const { plan, notesBody, noteCreator } = req.body;
  const values = [plan, taskID];
  const args = ["task_plan"];

  const updateQuery = updateQueryBuilder("task", "task_id", args);
  try {
    const updateResult = await withTransaction(async (connection) => {
      if (notesBody) {
        const newNote = buildNote(notesBody, 1, noteCreator);
        const updateResult = await exports.addNotes(connection, [newNote], taskID);
      }
      const updateResult = await connection.execute(updateQuery, values);
    });
    res.send("Task successfully updated");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error updating task: " + err.message });
  }
};

// this should only be called when user wants to add a note. Other notes being added should be part of their respective APIs
exports.addNotesRoute = async function (req, res) {
  const { body, noteCreator } = req.body;
  const { taskID } = req.params;
  const mandatoryFields = ["body", "noteCreator"];
  let anyEmptyFields = false;
  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    if (isValueEmpty(req.body[field])) {
      res.status(400).json({ message: `${field} must not be empty` });
      anyEmptyFields = true;
      break;
    }
  }
  if (anyEmptyFields) {
    return;
  }
  try {
    const newNote = buildNote(body, 1, noteCreator);
    const addNotesResult = await exports.addNotes(null, [newNote], taskID);
    res.send("Notes updated successfully");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error adding note: " + err.message });
  }
};

/**
 * This function should always be part of a transaction. If for some reason it is not, pass in null as the first argument.
 */
exports.addNotes = async function (connection, notes, taskID) {
  try {
    const getResult = await exports.getTaskByID(taskID);
    if (getResult.length === 0) {
      const error = new Error("Task with specified task ID does not exist");
      error.code = 400;
      throw error;
    }
    // do we also want to check if the noteCreator is a valid user?
    const oldNotes = JSON.parse(getResult[0].Task_notes);
    const newNotes = oldNotes.concat(notes);
    const updateQuery = "UPDATE task SET task_notes = ? WHERE (task_id = ?);";
    if (connection) {
      const addNoteResult = await withTransaction(async () => {
        const updateResult = await connection.execute(updateQuery, [newNotes, taskID]);
        return updateResult;
      });
    } else {
      const updateResult = await executeQuery(updateQuery, [newNotes, taskID]);
      return updateResult;
    }
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    const error = new Error(err.message);
    error.code = err.code || 500;
    throw error;
  }
};

exports.releaseTask = async function (req, res) {
  const { taskID } = req.params;
  const { notesBody, noteCreator } = req.body;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_TODO, notesBody, noteCreator);
    res.send("Task successfully released");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error releasing task: " + err.message });
  }
};

exports.demoteTask = async function (req, res) {
  const { taskID } = req.params;
  const { notesBody, noteCreator } = req.body;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_TODO, notesBody, noteCreator);
    res.send("Task successfully demoted");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error demoting task: " + err.message });
  }
};

exports.workOnTask = async function (req, res) {
  const { taskID } = req.params;
  const { notesBody, noteCreator } = req.body;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_DOING, notesBody, noteCreator);
    res.send("Task successfully set to being worked on");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error setting task to being worked on: " + err.message });
  }
};

exports.seekApproval = async function (req, res) {
  const { acronym, taskID } = req.params;
  const { notesBody, noteCreator } = req.body;
  try {
    // trigger the sending of email.

    // first, get the project lead group (which is the group in app_permit_done)
    const getPermitDoneQuery = "SELECT App_permit_Done FROM application WHERE (app_acronym = ?)";
    const getPermitDoneResult = await executeQuery(getPermitDoneQuery, [acronym]);
    const projectLeadGroup = getPermitDoneResult[0].App_permit_Done;

    // next, get all the emails of users in the project lead group
    const getUsersQuery =
      "SELECT user_username, user_email FROM user LEFT JOIN user_group ON user.user_username=user_group.user_group_username WHERE (user_enabled=1) AND (user_group_groupName= ? );";
    const getUsersResult = await executeQuery(getUsersQuery, [projectLeadGroup]);
    const emails = [];
    getUsersResult.forEach((user) => {
      if (user.user_email) {
        emails.push(user.user_email);
      }
    });

    // lastly, send out the emails using nodemailer

    // just testing it (this works!)
    // await sendEmail(process.env.EMAIL_USER, "Test nodemailer email", "Hello, this is a test email from my Node.js app!");

    // only set this flag to true when we want to send emails.
    const FLAG = false;
    if (FLAG) {
      for (let i = 0; i < emails.length; i++) {
        await sendEmail(
          emails[i],
          `Seek approval for task ${taskID}`,
          `A user has triggered a seek approval action for task ${taskID} at ${new Date().toLocaleTimeString()}. Please log on to TMS to approve or reject the task.`
        );
      }
    }

    // only if all the emails are sent do we set the task status to DONE
    const updateResult = await exports.stateTransition(taskID, STATE_DONE, notesBody, noteCreator);
    res.send("Seek approval successful");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error seeking approval: " + err.message });
  }
};

exports.rejectTask = async function (req, res) {
  const { taskID } = req.params;
  const { notesBody, noteCreator } = req.body;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_DOING, notesBody, noteCreator);
    res.send("Task successfully rejected");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error rejecting task: " + err.message });
  }
};

exports.approveTask = async function (req, res) {
  const { taskID } = req.params;
  const { notesBody, noteCreator } = req.body;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_CLOSED, notesBody, noteCreator);
    res.send("Task successfully approved");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error approving task: " + err.message });
  }
};

exports.stateTransition = async function (taskID, newState, notesBody, noteCreator) {
  // maybe TODO validate the state changes

  // get the previous state of the task
  try {
    const task = await exports.getTaskByID(taskID);
    if (task.length === 0) {
      const error = new Error("Task does not exist");
      error.code = 400;
      throw error;
    }
    const oldState = task[0].Task_state;
    const newNoteBody = `${oldState} >> ${newState}`;
    const isStateChanged = oldState !== newState;

    const updateQuery = "UPDATE task SET task_state = ? WHERE (task_id = ?);";
    const notes = [];
    if (isStateChanged) {
      const systemNote = buildNote(newNoteBody, 0, process.env.SYSTEM_USER);
      notes.push(systemNote);
    }
    if (notesBody && noteCreator) {
      const userNote = buildNote(notesBody, 1, noteCreator);
      notes.push(userNote);
    }
    // add the notes and update in a transaction
    const transactionResult = await withTransaction(async (connection) => {
      // the actual state transition
      const updateResult = await connection.execute(updateQuery, [newState, taskID]);
      // adding the notes
      if (notes.length > 0) {
        const addNotesResult = await exports.addNotes(connection, notes, taskID);
      }
    });
    return transactionResult;
  } catch (err) {
    const error = new Error("Error getting task: " + err.message);
    error.code = 500;
    throw error;
  }
};

exports.getTaskByID = async function (taskID) {
  const getQuery = "SELECT * FROM task WHERE (task_id = ?);";
  try {
    const result = await executeQuery(getQuery, [taskID]);
    return result;
  } catch (err) {
    const error = new Error("Error getting task: " + err.message);
    error.code = 500;
    throw error;
  }
};

/**
 * Helper function to build a note. This is simply here to prevent the mental overhead of building the JSON object and having to remember the date posted field.
 */
function buildNote(notesBody, type, noteCreator = process.env.SYSTEM_USER) {
  const newNote = { text: notesBody, date_posted: new Date().toLocaleTimeString(), creator: noteCreator, type };
  return newNote;
}
