const { executeQuery } = require("../util/sql");
require("dotenv").config();

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
  if (user.length === 0 && username !== process.env.DUMMY_USER) {
    throw new Error("Cannot assign a group to a user that does not exist.");
  }
  // we also should probably check if the group already exists, but I will save that for later
  // user exists and we can execute the query
  try {
    const result = await executeQuery(query, [username, groupname]);
    return result;
  } catch (err) {
    if (err.message.includes("Duplicate entry")) {
      throw new Error("User is already assigned to this group!");
    } else {
      throw new Error("Error assigning user to a group");
    }
  }
};

exports.validateFields = (username, password, res) => {
  // check if username contains any special characters (this regex in particular also makes sure it cannot be empty)
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  const isUsernameMatch = username.match(alphanumericRegex);
  if (!isUsernameMatch) {
    res.status(400).json({ message: "Username cannot contain special characters or be empty." });
    return false;
  }

  // password validation. The regex below checks for the following:
  // Between 8 to 10 characters, must not contain spaces, must have at least one alphabet, number and special character
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,10}$/;
  const isPasswordMatch = password.match(passwordRegex);
  if (!isPasswordMatch) {
    res.status(400).json({
      message: "Password has to be between 8-10 characters and has to be alphanumeric with special characters.",
    });
    return false;
  }
  return true;
};
