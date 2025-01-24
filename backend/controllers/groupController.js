const { executeQuery } = require("../util/sql");
const { getUser } = require("./userController");

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
exports.assignGroup = async function (req, res) {
  const { username, groupname } = req.body;
  const query = "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?);";
  // first need to check that the user exists in the database
  const user = await getUser(username);
  // by right this should never happen from the user side, but I am still going to blame the user because i can
  if (user.length === 0) {
    res.status(401).send("Cannot assign a group to a user that does not exist.");
    return;
  }
  // user exists and we can execute the query
  try {
    const result = await executeQuery(query, [username, groupname]);
    res.send(result);
  } catch (err) {
    if (err.message.includes("Duplicate entry")) {
      // again, this should not happen but i am going to blame the user
      res.status(400).send("User is already assigned to this group!");
    } else {
      res.status(500).send("Error assigning user to a group");
    }
  }
  return;
};

// a request version so that it is easy to test
exports.checkGroupRoute = async function (req, res) {
  const { username, groupname } = req.body;
  const isInGroup = await exports.checkGroup(username, groupname);
  res.send(isInGroup);
};

exports.checkGroup = async function (username, groupname) {
  // first check if the user actually exists
  const user = await getUser(username);
  if (user.length === 0) {
    res.status(401).send("Cannot check the groups of a user that does not exist.");
    return;
  }
  try {
    const groupArr = await exports.getGroups(username);
    return groupArr.includes(groupname);
  } catch (err) {
    console.error("Error checking group", err.message);
  }
};

exports.getGroups = async function (username) {
  try {
    const query = "SELECT user_group_groupName FROM user_group WHERE user_group_username=?;";
    const result = await executeQuery(query, [username]);
    // convert into a form that is just an array of group names
    const groupArr = result.map((group) => {
      return group.user_group_groupName;
    });
    return groupArr;
  } catch (err) {
    console.error("Error getting groups");
  }
};
