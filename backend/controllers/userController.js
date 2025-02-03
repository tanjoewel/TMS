const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { getUser, addGroupRow } = require("../util/commonQueries");

exports.getAllUsers = async function (req, res) {
  // need to get the user groups as well, and remove password from the query
  const query =
    "SELECT user_username, user_email, user_enabled, IFNULL(GROUP_CONCAT(user_group_groupname SEPARATOR ','), '') AS `groups` FROM tms.user LEFT JOIN user_group ON user_username=user_group_username GROUP BY user_username, user_email, user_enabled ORDER BY user_username;";
  try {
    const result = await executeQuery(query);
    // format the result

    // first, convert the boolean value in the database to a form that is readable by the user.
    result.map((e) => {
      if (e.user_enabled === 1) {
        e.user_enabled = "Enabled";
      } else {
        e.user_enabled = "Disabled";
      }
      return e;
    });

    // combine the groups together
    result.forEach((user) => {
      let groupsArr = user.groups.split(",");
      if (groupsArr[0] === "") {
        groupsArr = [];
      }
      user.groups = groupsArr;
    });
    res.send(result);
    return result;
  } catch (err) {
    res.status(500).send("Error fetching users: " + err.message);
  }
};

exports.createUser = async function (req, res) {
  try {
    const { username, password, email, groups, accountStatus } = req.body;

    // check if user already exists. Need to make it case insensitive
    const user = await getUser(username);
    if (user.length > 0) {
      res.status(400).json({ message: `Username is already taken.` });
      return;
    }

    // check if username contains any special characters (this regex in particular also makes sure it cannot be empty)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const isUsernameMatch = username.match(alphanumericRegex);
    if (!isUsernameMatch) {
      res.status(400).json({ message: "Username cannot contain special characters or be empty." });
      return;
    }

    // password validation. The regex below checks for the following:
    // Between 8 to 10 characters, must not contain spaces, must have at least one alphabet, number and special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,10}$/;
    const isPasswordMatch = password.match(passwordRegex);
    if (!isPasswordMatch) {
      res.status(400).json({
        message: "Password has to be between 8-10 characters and has to be alphanumeric with special characters and is case sensitive",
      });
      return;
    }

    const query = `INSERT INTO user (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ?)`;
    // hash the password before storing it into database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const result = await executeQuery(query, [username, hash, email, accountStatus]);
    // only if the above query executes, then we add groups. However, note that with this implementation it is possible that we successfully add the user but fail to assign the user to the groups. In which case, the way to solve it would be using a transaction. Perhaps that can be a later feature?
    if (groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        await addGroupRow(username, groups[i]);
      }
    }
    res.status(200).send("User successfully created");
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Error creating users: " + err.message });
  }
};

exports.updateUser = async function (req, res) {
  try {
    const { username, password, email, groups, accountStatus } = req.body;

    // first check if the user exists in the database. By right this should not happen, so this should be a 500.
    const user = await getUser(username);
    console.log(req.body);
    // console.log("hi", user);
    if (user.length === 0) {
      res.status(500).json({ message: `User not found` });
      return;
    }

    // hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const query = "UPDATE user SET user_username = ?, user_password = ?, user_email = ?, user_enabled = ? WHERE (user_username = ?);";
    const result = await executeQuery(query, [username, hash, email, accountStatus, username]);

    // update the groups, this one is going to be a bit tricky to maintain idempotency
    // first, delete every record in user_groups of this user
    const deleteGroupsQuery = "DELETE FROM user_group WHERE (user_group_username = ?)";
    const deleteGroupsResult = await executeQuery(deleteGroupsQuery, [username]);

    // then, add groups
    if (groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        await addGroupRow(username, groups[i]);
      }
    }
    res.status(200).send("User successfully updated");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user: " + err.message });
  }
};
