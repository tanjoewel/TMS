const { executeQuery, createQueryBuilder, withTransaction, updateQueryBuilder } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");
const { getApplication } = require("./applicationController");
const { STATE_OPEN, STATE_CLOSED, STATE_DOING, STATE_DONE, STATE_TODO } = require("../util/enums");

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
        const updateResult = await exports.addNotes(connection, notesBody, 1, taskID, noteCreator);
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
    const addNotesResult = await withTransaction(async (connection) => {
      const updateResult = await exports.addNotes(connection, body, 1, taskID, noteCreator);
    });
    res.send("Notes updated successfully");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error adding note: " + err.message });
  }
};

/**
 * This function should always be part of a transaction.
 */
exports.addNotes = async function (connection, notesBody, type, taskID, noteCreator = process.env.SYSTEM_USER) {
  try {
    const getResult = await exports.getTaskByID(taskID);
    if (getResult.length === 0) {
      const error = new Error("Task with specified task ID does not exist");
      error.code = 400;
      throw error;
    }
    // do we also want to check if the noteCreator is a valid user?
    const oldNotes = JSON.parse(getResult[0].Task_notes);
    const newNote = { text: notesBody, date_posted: new Date().toLocaleTimeString(), creator: noteCreator, type };
    oldNotes.push(newNote);
    const updateQuery = "UPDATE task SET task_notes = ? WHERE (task_id = ?);";
    const addNoteResult = await withTransaction(async () => {
      const updateResult = await connection.execute(updateQuery, [oldNotes, taskID]);
      return updateResult;
    });
  } catch (err) {
    const error = new Error(err.message);
    error.code = err.code || 500;
    throw error;
  }
};

exports.releaseTask = async function (req, res) {
  const { taskID } = req.params;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_TODO);
    res.send("Task successfully released");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error releasing task: " + err.message });
  }
};

exports.demoteTask = async function (req, res) {
  const { taskID } = req.params;
  try {
    const updateResult = await exports.stateTransition(taskID, STATE_TODO);
    res.send("Task successfully released");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error demoting task: " + err.message });
  }
};

exports.stateTransition = async function (taskID, newState) {
  // maybe TODO validate the state changes

  // i need to add a note to reflect the state change

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

    const updateQuery = "UPDATE task SET task_state = ? WHERE (task_id = ?);";
    // add the notes and update in a transaction
    const transactionResult = await withTransaction(async (connection) => {
      const updateResult = await executeQuery(updateQuery, [newState, taskID]);
      const addNoteResult = await exports.addNotes(connection, newNoteBody, 0, taskID);
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
