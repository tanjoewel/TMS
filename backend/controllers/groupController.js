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

// i probably want two functions, one to create group by itself and one to assign a user to a group (which is basically creating a row in the user_group table)
// but for now, i will just implement this as assigning a user to a group, but not even checking to see if a user exists.
exports.createGroup = async function (req, res) {
  return;
};

// will require some groups in the database first.
exports.checkGroup = async function (req, res) {
  return;
};
