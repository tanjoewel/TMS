require("dotenv").config();
const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { getUser, addGroupRow, validateFields } = require("../util/commonQueries");

exports.getAllUsers = async function (req, res) {
  // this query concatenates the groups together so that it is easier to process
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

    const isValid = validateFields(username, password, res);
    if (!isValid) {
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

    // first check if the user exists in the database. By right this should not happen for requests from frontend, but it could happen for requests from Postman
    const user = await getUser(username);
    if (user.length === 0) {
      res.status(400).json({ message: `User not found` });
      return;
    }

    // i don't like putting this here, but it is so specific that it makes the most sense i think to put it here
    if (username === process.env.HARDCODED_ADMIN && !groups.includes(HARDCODED_ADMIN_GROUP)) {
      res.status(400).json({ message: "You cannot remove the hardcoded admin from the admin group" });
      return;
    }

    if (username === process.env.HARDCODED_ADMIN && accountStatus === 0) {
      res.status(400).json({ message: "You cannot disable the hardcoded admin" });
      return;
    }

    // if password was left empty, just update everything else
    if (password === "") {
      const query = "UPDATE user SET user_email = ?, user_enabled = ? WHERE (user_username = ?);";
      const result = await executeQuery(query, [email, accountStatus, username]);
    } else {
      const isValid = validateFields(username, password, res);
      if (!isValid) {
        return;
      }

      // hash password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const query = "UPDATE user SET user_username = ?, user_password = ?, user_email = ?, user_enabled = ? WHERE (user_username = ?);";
      const result = await executeQuery(query, [username, hash, email, accountStatus, username]);
    }
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

exports.updateProfile = async function (req, res) {
  try {
    // we only want the request body to contain 3 things: the updated email, updated password and the username of the user trying to update it
    const { username, updatedEmail, updatedPassword } = req.body;

    // do I want to check user exists? yes for postman APIs
    const user = getUser(username);
    if (user.length === 0) {
      res.status(400).json({ message: "User not found." });
      return;
    }

    // I do want to validate the password, so I am just going to re-use validateFields but pass in a hardcoded proper username so it always passes that check
    const isValid = validateFields("admin", updatedPassword, res);
    if (!isValid) {
      return;
    }

    // salt and hash the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(updatedPassword, salt);

    const query = "UPDATE user SET user_password = ?, user_email = ? WHERE (user_username = ?);";
    const result = executeQuery(query, [hash, updatedEmail, username]);
    res.status(200).send("Profile successfully updated");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile: " + err.message });
  }
};
