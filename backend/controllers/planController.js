const { createQueryBuilder, executeQuery } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");

exports.createPlan = async function (req, res) {
  const { plan_mvp_name, plan_startDate, plan_endDate, plan_app_acronym, plan_color } = req.body;
  const query = createQueryBuilder("plan", ["plan_mvp_name", "plan_startDate", "plan_endDate", "plan_app_acronym", "plan_color"]);
  const mandatoryFields = ["plan_mvp_name", "plan_app_acronym"];
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
    const result = await executeQuery(query, [plan_mvp_name, plan_startDate, plan_endDate, plan_app_acronym, plan_color]);
    res.send("Plan successfully created");
  } catch (err) {
    res.status(500).json({ message: "Error creating plan: " + err.message });
  }
};

exports.getPlansForApp = async function (req, res) {
  const { acronym } = req.params;
  const query = "SELECT * FROM plan WHERE (plan_app_acronym=?)";
  try {
    const result = await executeQuery(query);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting plans: " } + err.message);
  }
};
