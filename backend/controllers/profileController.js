const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { validateFields } = require("../util/commonQueries");

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
