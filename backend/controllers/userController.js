const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");

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

/**
 * Helper function to check if a user exists in the database
 */
exports.getUser = async function (username) {
  const query = "SELECT * FROM tms.user WHERE user_username = ?;";
  const result = await executeQuery(query, [username]);
  return result;
};

exports.createUser = async function (req, res) {
  try {
    // do username validation here?
    const { username, password, email } = req.body;
    const query = `INSERT INTO user (user_username, user_password, user_email) VALUES (?, ?, ?)`;
    // hash the password before storing it into database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const result = executeQuery(query, [username, hash, email]);
    res.status(200).send("User successfully created");
  } catch (err) {
    res.status(500).send("Error creating users");
  }
};
