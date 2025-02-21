const { executeQuery } = require("../util/sql");
const { addGroupRow, getDistinctGroups, getAppPermissions } = require("../util/commonQueries");
require("dotenv").config();

// needed to display the groups in drop down
exports.getDistinctGroups = async function (req, res) {
  try {
    const distinctGroups = await getDistinctGroups();
    res.send(distinctGroups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups." + err.message });
  }
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

exports.isUserPM = async function (req, res) {
  const { username } = req.params;
  try {
    const groups = await exports.getGroups(username);
    const isPM = groups.includes(process.env.HARDCODED_PM_GROUP);
    res.send(isPM);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

exports.canCreateTask = async function (req, res) {
  const { username, acronym } = req.params;
  try {
    const groups = await exports.getGroups(username);
    // get the permit_create from applications table
    const permitCreateGroup = await getAppPermissions(acronym, "App_permit_Create");

    const canCreate = groups.includes(process.env.HARDCODED_PL_GROUP) || groups.includes(permitCreateGroup);
    res.send(canCreate);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

// for creating a group without a user
exports.createGroup = async function (req, res) {
  const { groupname } = req.body;
  // it doesnt work to just leave the user as null, so we give it a username that cannot exist because of validation rules
  const username = process.env.DUMMY_USER;
  // group name verification
  if (groupname.length === 0) {
    res.status(400).json({ message: "Group name must not be empty" });
    return;
  }
  if (groupname.length > 50) {
    res.status(400).json({ message: "Please use a group name that is 50 characters or less." });
    return;
  }
  const groupnameRegex = /[a-zA-Z0-9_]+/;
  const isMatch = groupname.match(groupnameRegex);
  if (!isMatch) {
    res.status(400).json({ message: "Group name must only contain alphanumeric characters and underscores." });
    return;
  }
  const distinctGroups = await getDistinctGroups();
  const lowercaseGroups = distinctGroups.map((group) => {
    return group.toLowerCase();
  });
  if (lowercaseGroups.includes(groupname.toLowerCase())) {
    res.status(400).json({ message: "Group already exists." });
    return;
  }
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
