const db = require("../util/db");
const sendEmail = require("../util/emailService");
const bcrypt = require("bcryptjs");

/**
 * Helper function to check if a user is logged in
 * @param {*} username
 * @param {*} password
 */
async function checkLogin(username, password) {
  const connection = await db.getConnection();
  try {
    const getUserQuery = "SELECT user_username, user_password, user_enabled FROM user WHERE (user_username = ?)";
    const [getUserResult] = await connection.execute(getUserQuery, [username]);
    if (getUserResult.length === 0) {
      return false;
    }
    const dbPassword = getUserResult[0].user_password;
    const isPasswordMatch = bcrypt.compareSync(password, dbPassword);
    return isPasswordMatch;
  } catch (err) {
    console.log(err.message);
    // idk lol
    return false;
  }
}

const APP_PERMISSIONS = {
  OPEN: "App_permit_Open",
  TODO: "App_permit_toDoList",
  DOING: "App_permit_Doing",
  DONE: "App_permit_Done",
  CREATE: "App_permit_Create",
};

async function checkAppPermit(username, state, appAcronym) {
  // const APP_PERMISSIONS = {
  //   OPEN: "App_permit_Open",
  //   TODO: "App_permit_toDoList",
  //   DOING: "App_permit_Doing",
  //   DONE: "App_permit_Done",
  //   CREATE: "App_permit_Create",
  // };
  // validate state
  if (!(state in APP_PERMISSIONS)) {
    const error = new Error();
    error.code = "E2023";
    throw error;
  }

  const columnName = APP_PERMISSIONS[state];

  const getAppQuery = `SELECT ${columnName} FROM application WHERE App_Acronym = ?`;
  const [appPermits] = await db.execute(getAppQuery, [appAcronym]);
  const permittedGroup = appPermits[0][columnName];

  const getGroupsQuery = "SELECT user_group_groupName FROM user_group WHERE (user_group_username = ?);";

  const [groups] = await db.execute(getGroupsQuery, [username]);

  const flatGroups = groups.map((group) => group.user_group_groupName);

  return flatGroups.includes(permittedGroup);
}

exports.createTask = async function (req, res) {
  const { task_app_acronym, task_name, task_description, task_plan, username, password } = req.body;
  // const { username, password } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    if (Object.keys(req.queries).length > 0) {
      await connection.rollback();
      return res.status(400).json({ code: "E1002" });
    }

    // payload errors
    if (!username || typeof username !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2001" });
    }

    if (!password || typeof password !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2002" });
    }

    const taskNameRegex = /^[a-zA-Z0-9\s]{1,50}$/;
    if (!task_name || typeof task_name !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2003" });
    }

    if (!taskNameRegex.test(task_name)) {
      await connection.rollback();
      return res.status(400).json({ code: "E2003" });
    }

    if (task_name.length > 50) {
      await connection.rollback();
      return res.status(400).json({ code: "E2003" });
    }

    if (!task_app_acronym || typeof task_app_acronym !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2004" });
    }

    if (task_plan && typeof task_plan !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9906" });
    }

    if (task_description && typeof task_description !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9905" });
    }

    // check format

    const planRegex = /^[a-zA-Z0-9_ -]{1,50}$/;

    if (task_plan && !planRegex.test(task_plan)) {
      await connection.rollback();
      return res.status(400).json({ code: "E9903" });
    }

    if (task_description && task_description.length > 65535) {
      await connection.rollback();
      return res.status(400).json({ code: "E9902" });
    }

    // IAM errors

    // replace with the actual function
    const isValidLogin = await checkLogin(username, password);
    if (!isValidLogin) {
      await connection.rollback();
      return res.status(400).send({ code: "E3001" });
    }

    // transaction errors
    const getAppRunningNumberQuery = "SELECT App_Rnumber FROM application WHERE (App_Acronym = ?);";
    const [app_Rnumber] = await connection.execute(getAppRunningNumberQuery, [task_app_acronym]);
    const app_RnumberValue = app_Rnumber[0].App_Rnumber;

    if (app_Rnumber.length === 0) {
      await connection.rollback();
      return res.status(400).send({ code: "App not found" });
    }

    const isPermitted = await checkAppPermit(username, "CREATE", task_app_acronym);
    if (!isPermitted) {
      await connection.rollback();
      return res.status(400).send({ code: "No create permission" });
    }

    if (task_plan) {
      const getTaskPlanQuery = "SELECT * FROM plan WHERE (Plan_MVP_name = ?) AND (Plan_app_Acronym = ?)";
      const [plan] = await connection.execute(getTaskPlanQuery, [task_plan, task_app_acronym]);
      if (plan.length === 0) {
        await connection.rollback();
        return res.status(400).send({ code: "Task plan not found" });
      }
    }
    // need to add notes that task is created successfully

    const newRNumber = app_RnumberValue + 1;
    const updateRNumberQuery = "UPDATE application SET App_RNumber = ? WHERE App_Acronym = ?";
    const updateRNumberResult = await connection.execute(updateRNumberQuery, [newRNumber, task_app_acronym]);

    await connection.commit();

    res.json({ code: "Task created successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(err.status || 500).json({ code: err.code || "create task catch all" });
  }
};

exports.getTaskbyState = async function (req, res) {
  const connection = await db.getConnection();
  const { username, password, task_app_acronym, state } = req.body;
  try {
    if (Object.keys(req.queries).length > 0) {
      await connection.rollback();
      return res.status(400).json({ code: "E1002" });
    }

    // payload errors
    if (!username || typeof username !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2001" });
    }

    if (!password || typeof password !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2002" });
    }

    if (!state || typeof state !== "string" || !(state in APP_PERMISSIONS)) {
      return res.status(400).send({ code: "Invalid or missing task state" });
    }

    if (!task_app_acronym || typeof task_app_acronym !== "string") {
      return res.status(400).send({ code: "E2004" });
    }

    // IAM errors

    // replace with the actual function
    const isValidLogin = await checkLogin(username, password);
    if (!isValidLogin) {
      await connection.rollback();
      return res.status(400).send({ code: "E3001" });
    }

    // transaction errors

    const getTasksByStateQuery = "SELECT * FROM task WHERE (Task_state = ?) AND (Task_app_Acronym = ?);";
    const [tasks] = await connection.execute(getTasksByStateQuery, [state, task_app_acronym]);

    res.json(tasks);
  } catch (err) {
    console.log(err.message);
    res.status(err.status || 500).json({ code: err.code || "get task catch all" });
  }
};

exports.promoteTask2Done = async function (req, res) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    if (Object.keys(req.queries).length > 0) {
      await connection.rollback();
      return res.status(400).json({ code: "E1002" });
    }

    const { username, password, task_id, notes } = req.body;

    // payload errors
    if (!username || typeof username !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2001" });
    }

    if (!password || typeof password !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E2002" });
    }

    if (!task_id || typeof task_id !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "Invalid or missing task id" });
    }

    if (notes && typeof notes !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "Invalid notes format" });
    }

    if (notes && notes.length > 65535) {
      await connection.rollback();
      return res.status(400).json({ code: "Notes too long" });
    }

    // IAM errors

    // replace with the actual function
    const isValidLogin = await checkLogin(username, password);
    if (!isValidLogin) {
      await connection.rollback();
      return res.status(400).send({ code: "E3001" });
    }

    // transaction errors

    const getTaskQuery = "SELECT Task_state, Task_notes, Task_app_Acronym FROM task WHERE (Task_id = ?);";
    const [getTaskResult] = await connection.execute(getTaskQuery, [task_id]);
    if (getTaskResult.length === 0) {
      await connection.rollback();
      return res.status(400).json({ code: "Task not found" });
    }

    const taskState = getTaskResult[0].Task_state;
    if (taskState !== "DOING") {
      await connection.rollback();
      return res.status(400).json({ code: "Task not in doing state" });
    }

    let parsedNotes = null;
    if (notes) {
      const note = {
        text: notes,
        creator: username,
        date_posted: new Date(),
        type: 0,
      };

      if (getTaskResult[0]?.Task_notes) {
        parsedNotes = JSON.parse(getTaskResult[0].Task_notes);
      } else {
        parsedNotes = [];
      }
      parsedNotes.unshift(note);
    }

    const task_app_acronym = getTaskResult[0].Task_app_Acronym;
    const isPermitted = await checkAppPermit(username, "DOING", task_app_acronym);
    if (!isPermitted) {
      await connection.rollback();
      return res.status(400).send({ code: "No promote task to done permission" });
    }

    const updateTaskQuery = "UPDATE task SET Task_state = 'DONE', Task_notes = ? WHERE (Task_id = ?);";
    const [updateTaskResult] = await connection.execute(updateTaskQuery, [parsedNotes, task_id]);

    // get the project lead group (which is the group in app_permit_done)
    const getPermitDoneQuery = "SELECT App_permit_Done FROM application WHERE (App_Acronym = ?)";
    const [getPermitDoneResult] = await connection.execute(getPermitDoneQuery, [task_app_acronym]);
    const projectLeadGroup = getPermitDoneResult[0].App_permit_Done;

    // get all the emails of users in the project lead group
    const getUsersQuery =
      "SELECT user_username, user_email FROM user LEFT JOIN user_group ON user.user_username=user_group.user_group_username WHERE (user_enabled=1) AND (user_group_groupName= ? );";
    const [getUsersResult] = await connection.execute(getUsersQuery, [projectLeadGroup]);
    const emails = [];
    getUsersResult.forEach((user) => {
      if (user.user_email) {
        emails.push(user.user_email);
      }
    });
    console.log(emails);

    for (let i = 0; i < emails.length; i++) {
      await sendEmail(
        emails[i],
        `Seek approval for task ${task_id}`,
        `A user has triggered a seek approval action for task ${task_id} at ${new Date().toLocaleString()}. Please log on to TMS to approve or reject the task.`
      );
    }

    await connection.commit();

    res.json({ code: "successful promote task 2 done" });
  } catch (err) {
    console.log(err.message);
    res.status(err.status || 500).json({ code: err.code || "promote task catch all" });
  }
};
