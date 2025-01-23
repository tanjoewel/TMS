require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, executeQuery } = require("./sql");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

const port = process.env.PORT;

app.get("/", async (req, res) => {
  const result = await executeQuery("SELECT * FROM user");
  console.log(result);
  res.send("Hello!!!!");
});

app.listen(port, () => {
  console.log("App listening");
});
