const { executeQuery, createQueryBuilder } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");
const { getApplication } = require("./applicationController");

exports.createTask = async function (req, res) {
  // subject to many, many changes down the line
  const { task_id, task_name, task_description, task_plan, task_app_acronym, task_creator, task_owner, task_createDate } = req.body;
  const { acronym } = req.params;
  // get the app and the running number
  const app = await getApplication(acronym);
  const task_state = "OPEN";
  const columnsArray = [
    "task_id",
    "task_name",
    "task_description",
    "task_notes",
    "task_plan",
    "task_app_acronym",
    "task_state",
    "task_creator",
    "task_owner",
    "task_createDate",
  ];
  let anyEmptyFields = false;
  const task_notes = "CREATE >> OPEN";
  const argsArray = [task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createDate];
  const mandatoryFields = ["task_name", "task_description", "task_app_acronym", "task_creator", "task_createDate"];
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
  const query = createQueryBuilder("task", columnsArray);
  try {
    const result = await executeQuery(query, argsArray);
    res.send("Task successfully created");
  } catch (err) {
    res.status(500).json({ message: "Error creating task: " + err.message });
  }
};

exports.getTasksForApp = async function (req, res) {
  // the app will be in the params
  const { acronym } = req.params;
  const query = "SELECT * FROM task WHERE (task_app_acronym=?)";
  try {
    const result = await executeQuery(query, [acronym]);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting tasks" + err.message });
  }
};
