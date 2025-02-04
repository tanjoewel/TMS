require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const userController = require("./controllers/userController");
const groupController = require("./controllers/groupController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./middleware/authenticateToken");
const { getUser } = require("./util/commonQueries");

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
  const result = await getUser(username);
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
  // check if user is disabled. should we still put this as the error message?
  if (result[0].user_enabled === 0) {
    res.status(401).send("Invalid username and password");
    return;
  }
  // if we reach here, this is a valid login

  // get the ip
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // get the browser type
  const userAgent = req.headers["user-agent"];

  // generate jwt token and send it. take note of the order
  const token = jwt.sign({ username, ip, userAgent }, process.env.JWT_SECRET, { expiresIn: "15m" });

  res.cookie("auth_token", token);

  // check if the user is an admin
  const isAdmin = await groupController.checkGroup(username, "admin");

  res.status(200).json({ message: "Login successful", isAdmin });
});

app.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.status(200).send("Logged out successfully");
});

app.get("/verify", authenticateToken, async (req, res) => {
  // middleware will do the verification of the token for us. Checking the logged in state should be done on frontend?
  const username = req.decoded.username;
  const isAdmin = await groupController.checkGroup(username, "admin");
  const user = await getUser(username);
  const isEnabled = user[0].user_enabled;
  res.status(200).json({ message: "User is valid.", username: req.decoded.username, isAdmin, isEnabled });
});

app.listen(port, () => {
  console.log("App listening");
});
