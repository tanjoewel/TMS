// this middleware takes in as information the task ID, the app acronym, and the user ID. it then checks for access permissions in the current state, and throws a 403 if the user is not authorized to use the API

// async function authenticateTaskMiddleware(req, res, next) {}
const { STATE_OPEN, STATE_CLOSED, STATE_DOING, STATE_DONE, STATE_TODO } = require("../util/enums");
const { executeQuery } = require("../util/sql");

// map to map the state to the correct columns in the app table
const stateToRow = new Map();
stateToRow.set(STATE_OPEN, "App_permit_Open");
stateToRow.set(STATE_TODO, "App_permit_toDoList");
stateToRow.set(STATE_DOING, "App_permit_Doing");
stateToRow.set(STATE_DONE, "App_permit_Done");

async function authenticateTask(req, res, next) {
  // these should be in the params
  const { acronym, taskID } = req.params;

  // this is available because it runs after authenticateToken
  const username = req.decoded.username;

  // get the current state of the task
  const getTaskStateQuery = "SELECT task_state FROM task WHERE (task_id = ?)";
  const getTaskStateResult = await executeQuery(getTaskStateQuery, [taskID]);
  if (getTaskStateResult.length === 0) {
    res.status(400).json({ message: "Task with given ID does not exist" });
    return;
  }
  const currentTaskState = getTaskStateResult[0].task_state;
  if (currentTaskState === STATE_CLOSED) {
    res.status(400).json({ message: "Task with given ID is closed. Currently no action is permitted when a task is closed." });
    return;
  }

  // get the permission based on the state
  const appTableColumn = stateToRow.get(currentTaskState);
  const getPermissionQuery = `SELECT ${appTableColumn} FROM application WHERE (App_Acronym = ?)`;
  const getPermissionResult = await executeQuery(getPermissionQuery, [acronym]);
  const permittedGroup = getPermissionResult[0][appTableColumn];

  // get the user groups. check if the permitted group is in the user groups. call next() if it is, throw 403 if it is not
  const getUserGroupsQuery =
    "SELECT user_username, user_group_groupname FROM user LEFT JOIN user_group ON user_username = user_group_username WHERE (user_username = ?) AND (user_group_groupname = ?)";
  const getUserGroupsResult = await executeQuery(getUserGroupsQuery, [username, permittedGroup]);
  console.log("CURRENT TASK STATE: ", getUserGroupsResult);

  if (getUserGroupsResult.length === 0) {
    res.status(403).json({ message: "User is not authorized to perform this action" });
    return;
  }

  // if we reach here, we have confirmed that the user is in the group for the current task. we let the user through to the next middleware
  next();
}

module.exports = authenticateTask;
