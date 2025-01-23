require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { executeQuery } = require("./util/sql");
const userRoutes = require("./routes/userRoutes");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

// routes
app.use("/users", userRoutes);

const port = process.env.PORT;

app.get("/", async (req, res) => {
  res.send("Server is up and running!");
});

app.listen(port, () => {
  console.log("App listening");
});
