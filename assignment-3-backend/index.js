require("dotenv").config();
const express = require("express");
var cookieParser = require("cookie-parser");

// security
const cors = require("cors");

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const port = process.env.PORT;

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Server is up and running!");
});

app.listen(port, () => {
  console.log("App listening");
});
