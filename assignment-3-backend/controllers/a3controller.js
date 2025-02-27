const db = require("../util/db");

exports.createTask = async function (req, res) {
  res.send("Create task");
};

exports.getTaskbyState = async function (req, res) {
  const connection = await db.getConnection();
  const query = "SELECT * FROM task";
  try {
    const [result] = await connection.execute(query);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get tasks" });
  }
};

exports.promoteTask2Done = async function (req, res) {
  res.send("promote task 2 done");
};
