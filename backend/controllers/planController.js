const { createQueryBuilder, executeQuery } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");

exports.createPlan = async function (req, res) {
  const { plan_mvp_name, plan_startDate, plan_endDate, plan_color } = req.body;
  const { acronym } = req.params;
  const query = createQueryBuilder("plan", ["plan_mvp_name", "plan_startDate", "plan_endDate", "plan_app_acronym", "plan_color"]);

  // validation
  const mandatoryFields = ["plan_mvp_name"];
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

  if (plan_mvp_name.length > 50 || plan_mvp_name.length === 0) {
    res.status(400).json({ message: "Plan MVP name must be between 1 and 50 characters inclusive" });
    return;
  }

  const alphanumericWithSpaceRegex = /^[0-9a-zA-Z\h]+$/;
  if (!plan_mvp_name.match(alphanumericWithSpaceRegex)) {
    res.status(400).json({ message: "Plan MVP name only contain alphanumeric characters and whitespaces" });
    return;
  }

  const dateRegex = /^(18|19|20|21)\d{2}-(0[1-9]|1[1,2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!plan_startDate.match(dateRegex)) {
    res.status(400).json({ message: "Start date must be of the form 'YYYY-MM-DD'" });
    return;
  }

  if (!plan_endDate.match(dateRegex)) {
    res.status(400).json({ message: "End date must be of the form 'YYYY-MM-DD'" });
    return;
  }

  const colorRegex = /^#[0-9ABCDEF]{6}$/;
  if (!plan_color.match(colorRegex)) {
    res.status(400).json({ message: "Color must be of the format '#XXXXXX' where X is a hexadecimal character" });
    return;
  }

  // auth - only hardcoded PM can create plan
  const username = req.decoded.username;
  const permittedGroup = process.env.HARDCODED_PM_GROUP;
  const getUserGroupsQuery =
    "SELECT user_username, user_group_groupname FROM user LEFT JOIN user_group ON user_username = user_group_username WHERE (user_username = ?) AND (user_group_groupname = ?)";
  const getUserGroupsResult = await executeQuery(getUserGroupsQuery, [username, permittedGroup]);

  if (getUserGroupsResult.length === 0) {
    res.status(403).json({ message: "User is not authorized to perform this action" });
    return;
  }

  try {
    const result = await executeQuery(query, [plan_mvp_name, plan_startDate, plan_endDate, acronym, plan_color]);
    res.send("Plan successfully created");
  } catch (err) {
    res.status(500).json({ message: "Error creating plan: " + err.message });
  }
};

exports.getPlansForApp = async function (req, res) {
  const { acronym } = req.params;
  const query = "SELECT * FROM plan WHERE (plan_app_acronym=?)";
  try {
    const result = await executeQuery(query, [acronym]);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting plans: " } + err.message);
  }
};
