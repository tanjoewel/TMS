const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { getUser } = require("../util/commonQueries");
const { validateFields } = require("../util/validation");

exports.updateProfile = async function (req, res) {
  try {
    // we only want the request body to contain 3 things: the updated email, updated password and the username of the user trying to update it
    const { username, updatedEmail, updatedPassword } = req.body;

    // this is all single call so not going to use transaction

    if (updatedEmail.length > 100) {
      res.status(400).json({ message: "Email must be 100 characters or less." });
      return;
    }

    if (updatedPassword.length === 0 && updatedEmail.length > 0) {
      const query = "UPDATE user SET user_email = ? WHERE (user_username = ?);";
      const result = executeQuery(query, [updatedEmail, username]);
    } else if (updatedEmail.length === 0 && updatedPassword.length === 0) {
      // nothing needs to happen here lol
    } else if (updatedEmail.length === 0 && updatedPassword.length > 0) {
      const isValid = validateFields("admin", updatedPassword, res);
      if (!isValid) {
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(updatedPassword, salt);

      const query = "UPDATE user SET user_password = ? WHERE (user_username = ?);";
      const result = executeQuery(query, [hash, username]);
    } else {
      const isValid = validateFields("admin", updatedPassword, res);
      if (!isValid) {
        return;
      }
      // salt and hash the password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(updatedPassword, salt);

      const query = "UPDATE user SET user_password = ?, user_email = ? WHERE (user_username = ?);";
      const result = executeQuery(query, [hash, updatedEmail, username]);
    }
    res.status(200).send("Profile successfully updated");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile: " + err.message });
  }
};

exports.getProfile = async function (req, res) {
  const username = req.decoded.username;
  try {
    const user = await getUser(username);
    const resObject = { username: user[0].user_username, email: user[0].user_email };
    res.status(200).json({ message: "Get profile successful.", body: resObject });
  } catch (err) {
    res.status(500).json({ message: "Error getting profile: " + err.message });
  }
};
