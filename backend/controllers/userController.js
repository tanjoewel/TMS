const { executeQuery } = require("../util/sql");

exports.getAllUsers = async function (req, res) {
  const query = "SELECT * FROM user";
  try {
    const result = await executeQuery(query);
    res.send(result);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
};
