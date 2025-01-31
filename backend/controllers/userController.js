const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");
const { addGroupRow } = require("../util/commonQueries");

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
    // do username validation here? To check that there are no duplicate usernames. Also note that we don't want user to be case sensitive.
    const { username, password, email, groups, accountStatus } = req.body;
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
    res.status(500).send("Error creating users: " + err.message);
  }
};
