require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const userController = require("./controllers/userController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authenticateToken");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// routes
app.use("/users", userRoutes);
app.use("/groups", groupRoutes);

const port = process.env.PORT;

app.get("/", async (req, res) => {
  res.send("Server is up and running!");
});

app.post("/login", async (req, res) => {
  // first check if username exists in the database.
  const { username, password } = req.body;
  const result = await userController.getUser(username);
  // query returns nothing, user does not exist, invalid username
  if (result.length === 0) {
    res.status(401).send("Invalid username and password");
    return;
  }
  // check if password hash matches
  const userPassword = result[0].user_password;
  const isPasswordMatch = bcrypt.compareSync(password, userPassword);
  if (!isPasswordMatch) {
    res.status(401).send("Invalid username and password");
    return;
  }
  // if we reach here, this is a valid login

  // get the ip
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // get the browser type
  const userAgent = req.headers["user-agent"];

  // generate jwt token and send it. take note of the order
  const token = jwt.sign({ username, ip, userAgent }, process.env.JWT_SECRET, { expiresIn: "10m" });

  res.cookie("auth_token", token);

  res.status(200).send("Login successful");
});

app.post("/logout", authenticateToken, (req, res) => {
  res.clearCookie("auth_token");
  res.status(200).send("Logged out successfully");
});

app.listen(port, () => {
  console.log("App listening");
});
