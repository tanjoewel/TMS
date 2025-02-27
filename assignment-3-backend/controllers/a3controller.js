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

async function checkAppPermit(username, state, appAcronym) {
  const APP_PERMISSIONS = {
    OPEN: "App_permit_Open",
    TODO: "App_permit_toDoList",
    DOING: "App_permit_Doing",
    DONE: "App_permit_Done",
    CREATE: "App_permit_Create",
  };
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

    // payload errors
    if (!task_app_acronym || typeof task_app_acronym !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9908" });
    }

    // check required fields
    if (!task_name || typeof task_name !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9907" });
    }

    // task_plan is optional, so only check if it is a string upon confirmation it exists
    if (task_plan && typeof task_plan !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9906" });
    }

    // same as task_plan, task_description is optional
    if (task_description && typeof task_description !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9905" });
    }

    // check format
    const taskNameRegex = /^[a-zA-Z0-9\s]{1,50}$/;
    const planRegex = /^[a-zA-Z0-9_ -]{1,50}$/;
    if (!taskNameRegex.test(task_name)) {
      await connection.rollback();
      return res.status(400).json({ code: "E9904" });
    }

    if (task_plan && !planRegex.test(task_plan)) {
      await connection.rollback();
      return res.status(400).json({ code: "E9903" });
    }

    if (task_description && task_description.length > 65535) {
      await connection.rollback();
      return res.status(400).json({ code: "E9902" });
    }

    // IAM errors
    if (!username || typeof username !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9900" });
    }

    if (!password || typeof password !== "string") {
      await connection.rollback();
      return res.status(400).json({ code: "E9901" });
    }

    const isValidLogin = await checkLogin(username, password);
    if (!isValidLogin) {
      await connection.rollback();
      return res.status(400).send({ code: "E3001" });
    }

    // transaction errors
    const getAppRunningNumberQuery = "SELECT App_Rnumber FROM application WHERE (App_Acronym = ?);";
    const [app_Rnumber] = await connection.execute(getAppRunningNumberQuery, [task_app_acronym]);
    console.log(app_Rnumber);
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

    const newRNumber = app_RnumberValue + 1;
    const updateRNumberQuery = "UPDATE application SET App_RNumber = ? WHERE App_Acronym = ?";
    const updateRNumberResult = await connection.execute(updateRNumberQuery, [newRNumber, task_app_acronym]);

    await connection.commit();

    res.json({ code: "Task created successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(err.status || 500).json({ code: err.code || "???" });
  }
};

exports.getTaskbyState = async function (req, res) {
  const connection = await db.getConnection();
  const query = "SELECT * FROM task";
  try {
    const [result] = await connection.execute(query);
    res.send(result);
  } catch (err) {
    res.status(err.status || 500).json({ code: err.code });
  }
};

exports.promoteTask2Done = async function (req, res) {
  res.send("promote task 2 done");
};
