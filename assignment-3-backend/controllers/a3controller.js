const db = require("../util/db");
const sendEmail = require("../util/emailService");

exports.createTask = async function (req, res) {
  res.send("Create task");
};

exports.getTaskbyState = async function (req, res) {
  const connection = await db.getConnection();
  const query = "SELECT * FROM task";
  try {
    const [result] = await connection.execute(query);
    await sendEmail(process.env.EMAIL_USER, "Test nodemailer email", "Hello, this is a test email from my Node.js app!");
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get tasks" });
  }
};

exports.promoteTask2Done = async function (req, res) {
  res.send("promote task 2 done");
};
