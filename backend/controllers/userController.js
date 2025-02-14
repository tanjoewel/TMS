require("dotenv").config();
const { executeQuery, withTransaction } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { getUser, addGroupRow } = require("../util/commonQueries");
const { validateFields } = require("../util/validation");

// exports.getAllUsers1 = async function (req, res) {
//   // this query concatenates the groups together so that it is easier to process
//   const query =
//     "SELECT user_username, user_email, user_enabled, IFNULL(GROUP_CONCAT(user_group_groupname SEPARATOR ','), '') AS `groups` FROM tms.user LEFT JOIN user_group ON user_username=user_group_username GROUP BY user_username, user_email, user_enabled ORDER BY user_username;";
//   try {
//     const result = await executeQuery(query);
//     // format the result

//     // combine the groups together
//     result.forEach((user) => {
//       let groupsArr = user.groups.split(",");
//       if (groupsArr[0] === "") {
//         groupsArr = [];
//       }
//       user.groups = groupsArr;
//     });
//     res.send(result);
//     return result;
//   } catch (err) {
//     res.status(500).send("Error fetching users: " + err.message);
//   }
// };

exports.getAllUsers = async function (req, res) {
  const groupsQuery = "SELECT user_group_username AS username, user_group_groupName AS groupname FROM tms.user_group;";
  const userGroups = await executeQuery(groupsQuery);
  const usersQuery = "SELECT user_username AS username, user_email AS email, user_enabled AS enabled FROM user";
  const users = await executeQuery(usersQuery);
  const groupMap = new Map();
  userGroups.forEach((row) => {
    if (row.username === process.env.DUMMY_USER) {
      return;
    }
    if (groupMap.has(row.username)) {
      groupMap.get(row.username).push(row.groupname);
    } else {
      groupMap.set(row.username, [row.groupname]);
    }
  });
  const result = users.map((user) => ({
    ...user,
    groups: groupMap.get(user.username) || [],
  }));
  res.send(result);
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

    if (username.length > 50) {
      res.status(400).json({ message: "Username must be 50 characters or less." });
      return;
    }

    if (email.length > 100) {
      res.status(400).json({ message: "Email must be 100 characters or less." });
      return;
    }

    // hash the password before storing it into database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    // transaction
    await withTransaction(async (connection) => {
      const userQuery = `INSERT INTO user (user_username, user_password, user_email, user_enabled) VALUES (?, ?, ?, ?)`;
      await connection.execute(userQuery, [username, hash, email, accountStatus]);
      const groupsQuery = "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?);";
      if (groups.length > 0) {
        for (let i = 0; i < groups.length; i++) {
          await connection.execute(groupsQuery, [username, groups[i]]);
        }
      }
    });
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
    if (username === process.env.HARDCODED_ADMIN && !groups.includes(process.env.HARDCODED_ADMIN_GROUP)) {
      res.status(400).json({ message: "You cannot remove the hardcoded admin from the admin group" });
      return;
    }

    if (username === process.env.HARDCODED_ADMIN && accountStatus === 0) {
      res.status(400).json({ message: "You cannot disable the hardcoded admin" });
      return;
    }

    // if password was left empty, just update everything else
    if (password === "") {
      await withTransaction(async (connection) => {
        const updateUserQuery = "UPDATE user SET user_email = ?, user_enabled = ? WHERE (user_username = ?);";
        await connection.execute(updateUserQuery, [email, accountStatus, username]);
        const deleteGroupsQuery = "DELETE FROM user_group WHERE (user_group_username = ?)";
        await connection.execute(deleteGroupsQuery, [username]);
        const addGroupsQuery = "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?);";
        if (groups.length > 0) {
          for (let i = 0; i < groups.length; i++) {
            await connection.execute(addGroupsQuery, [username, groups[i]]);
          }
        }
      });
    } else {
      const isValid = validateFields(username, password, res);
      if (!isValid) {
        return;
      }

      if (username.length > 50) {
        res.status(400).json({ message: "Username must be 50 characters or less." });
        return;
      }

      if (email.length > 100) {
        res.status(400).json({ message: "Email must be 100 characters or less." });
        return;
      }

      // hash password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      await withTransaction(async (connection) => {
        const updateUserQuery = "UPDATE user SET user_password = ?, user_email = ?, user_enabled = ? WHERE (user_username = ?);";
        await connection.execute(updateUserQuery, [hash, email, accountStatus, username]);
        const deleteGroupsQuery = "DELETE FROM user_group WHERE (user_group_username = ?)";
        await connection.execute(deleteGroupsQuery, [username]);
        const addGroupsQuery = "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?);";
        if (groups.length > 0) {
          for (let i = 0; i < groups.length; i++) {
            await connection.execute(addGroupsQuery, [username, groups[i]]);
          }
        }
      });
    }
    res.status(200).send("User successfully updated");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user: " + err.message });
  }
};

exports.deleteUser = async function (req, res) {
  // delete user here, the req should just be the username
  const { username } = req.body;

  // delete the user from the database
  try {
    const deleteUserQuery = "DELETE FROM user WHERE (user_username = ?);";
    const deleteUserResult = await executeQuery(deleteUserQuery, [username]);

    // delete the groups from the database
    const deleteGroupsQuery = "DELETE FROM user_group WHERE (user_group_username = ?);";
    const deleteGroupsResult = await executeQuery(deleteGroupsQuery, [username]);

    res.send("User successfully deleted");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user " + err.message });
  }
};
