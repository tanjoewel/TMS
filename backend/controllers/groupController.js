const { executeQuery } = require("../util/sql");

// needed to display the groups in drop down
exports.getGroups = async function (req, res) {
  const query = "SELECT DISTINCT user_group_groupName FROM user_group;";
  try {
    const result = await executeQuery(query);
    const distinctGroups = [];
    result.map((row) => {
      distinctGroups.push(row["user_group_groupName"]);
    });
    res.send(distinctGroups);
    return result;
  } catch (err) {
    res.status(500).send("Error fetching groups.");
  }
  return;
};

exports.createGroup = async function (req, res) {
  return;
};
