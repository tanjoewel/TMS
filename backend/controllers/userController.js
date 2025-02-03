const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { getUser, addGroupRow } = require("../util/commonQueries");

exports.getAllUsers = async function (req, res) {
  const query = "SELECT * FROM user";
  // on the frontend, send the cookie as a header and then in the backend access it with req.header[<header name>]
  try {
    const result = await executeQuery(query);
    // convert the boolean value in the database to a form that is readable by the user.
    result.map((e) => {
      if (e.user_enabled === 1) {
        e.user_enabled = "enabled";
      } else {
        e.user_enabled = "disabled";
      }
      return e;
    });
    res.send(result);
    return result;
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
};

exports.createUser = async function (req, res) {
  try {
    const { username, password, email, groups, accountStatus } = req.body;

    // check if user already exists. Need to make it case insensitive
    const user = await getUser(username);
    if (user.length > 0) {
      res.status(400).json({ message: `User with username ${username} already exists.` });
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

    // check if username contains any special characters (this regex in particular also makes sure it cannot be empty)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    const isUsernameMatch = username.match(alphanumericRegex);
    if (!isUsernameMatch) {
      res.status(400).json({ message: "Invalid username. Please only use alphanumeric characters and ensure it is not empty." });
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
