const { createQueryBuilder, executeQuery } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");

exports.createPlan = async function (req, res) {
  const { Plan_MVP_name, Plan_startDate = null, Plan_endDate = null } = req.body;
  const { acronym } = req.params;
  const Plan_Color = generateRandomPlanColor();
  const query = createQueryBuilder("plan", ["Plan_MVP_name", "Plan_startDate", "Plan_endDate", "Plan_app_Acronym", "Plan_Color"]);

  // validation
  const mandatoryFields = ["Plan_MVP_name"];
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

  if (Plan_MVP_name.length > 50 || Plan_MVP_name.length === 0) {
    res.status(400).json({ message: "Plan MVP name must be between 1 and 50 characters inclusive" });
    return;
  }

  const alphanumericWithSpaceRegex = /^[0-9a-zA-Z\s]+$/;
  if (!Plan_MVP_name.match(alphanumericWithSpaceRegex)) {
    res.status(400).json({ message: "Plan MVP name must only contain alphanumeric characters and whitespaces" });
    return;
  }

  const dateRegex = /^(0?[1-9]|1[1,2])\/(0?[1-9]|[12][0-9]|3[01])\/(18|19|20|21)\d{2}$/;
  if (Plan_startDate) {
    if (!Plan_startDate.match(dateRegex)) {
      res.status(400).json({ message: "Start date must be of the form 'MM/DD/YYYY'" });
      return;
    }
  }
  if (Plan_endDate) {
    if (!Plan_endDate.match(dateRegex)) {
      res.status(400).json({ message: "End date must be of the form 'MM/DD/YYYY'" });
      return;
    }
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
    const result = await executeQuery(query, [Plan_MVP_name, Plan_startDate, Plan_endDate, acronym, Plan_Color]);
    res.send("Plan successfully created");
  } catch (err) {
    res.status(500).json({ message: "Error creating plan: " + err.message });
  }
};

exports.getPlansForApp = async function (req, res) {
  const { acronym } = req.params;
  const query = "SELECT * FROM plan WHERE (Plan_app_Acronym=?)";
  try {
    const result = await executeQuery(query, [acronym]);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting plans: " } + err.message);
  }
};

function generateRandomPlanColor() {
  // generate a random plan color in hexcode and return it;
  const allowedCharacters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
  let hexString = "#";
  for (let i = 0; i < 6; i++) {
    const randomCharacter = allowedCharacters[Math.floor(Math.random() * allowedCharacters.length)];
    hexString += randomCharacter;
  }
  return hexString;
}
