const { executeQuery } = require("../util/sql");

/**
 * Helper function to check if a user exists in the database
 */
exports.getUser = async function (username) {
  const query = "SELECT * FROM tms.user WHERE user_username = ?;";
  const result = await executeQuery(query, [username]);
  return result;
};

/**
 * Helper function to add a group row into the database. This is used in at least three different places.
 * @param {*} username
 * @param {*} groupname
 * @returns
 */
exports.addGroupRow = async function (username, groupname) {
  const query = "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?);";
  const user = await exports.getUser(username);
  // by right this should never happen from the user side, but I am still going to blame the user because i can
  if (user.length === 0 && username !== "$NULL") {
    throw new Error("Cannot assign a group to a user that does not exist.");
  }
  // we also should probably check if the group already exists, but I will save that for later
  // user exists and we can execute the query
  try {
    const result = await executeQuery(query, [username, groupname]);
    return result;
  } catch (err) {
    if (err.message.includes("Duplicate entry")) {
      // again, this should not happen but i am going to blame the user
      throw new Error("User is already assigned to this group!");
    } else {
      throw new Error("Error assigning user to a group");
    }
  }
};
