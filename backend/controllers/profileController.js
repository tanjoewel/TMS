const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { getUser, validateFields } = require("../util/commonQueries");

exports.updateProfile = async function (req, res) {
  try {
    // we only want the request body to contain 3 things: the updated email, updated password and the username of the user trying to update it
    const { username, updatedEmail, updatedPassword } = req.body;

    // do I want to check user exists?

    // I do want to validate the password, so I am just going to re-use validateFields but pass in a hardcoded proper username so it always passes that check
    const isValid = validateFields("admin", updatedPassword, res);
    if (!isValid) {
      return;
    }

    if (updatedEmail.length > 100) {
      res.status(400).json({ message: "Email must be 100 characters or less." });
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
