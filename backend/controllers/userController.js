const { executeQuery } = require("../util/sql");

exports.getAllUsers = async function (req, res) {
  const query = "SELECT * FROM user";
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
    // do username validation here?
    const { username, password, email } = req.body;
    const query = `INSERT INTO user (user_username, user_password, user_email) VALUES (?, ?, ?)`;
    const result = executeQuery(query, [username, password, email]);
  } catch (err) {
    res.status(500).send("Error creating users");
  }
};
