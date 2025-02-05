const { executeQuery } = require("../util/sql");
const { getUser, addGroupRow } = require("../util/commonQueries");

// needed to display the groups in drop down
exports.getDistinctGroups = async function (req, res) {
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
    res.status(500).json({ message: "Error fetching groups." + err.message });
  }
  return;
};

// i probably want two functions, one to create group by itself and one to assign a user to a group (which is basically creating a row in the user_group table)
exports.assignGroup = async function (req, res) {
  const { username, groupname } = req.body;
  // do i want to check if the group name exists in the database first?
  // also, might need to change this to accept an array of groupnames instead of just one group, in which case I think its fine to just run the query multiple times.
  try {
    const result = await addGroupRow(username, groupname);
    res.status(200).json({ message: "Group successfully assigned" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// for creating a group without a user
exports.createGroup = async function (req, res) {
  const { groupname } = req.body;
  // it doesnt work to just leave the user as null, so we give it a username that cannot exist because of validation rules
  const username = "$NULL";
  try {
    const result = await addGroupRow(username, groupname);
    res.status(200).json({ message: "Group successfully created" });
  } catch (err) {
    res.status(500).json({ message: "Error creating group: " + err.message });
  }
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
    throw new Error("Attempted to check group of user that does not exist");
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
