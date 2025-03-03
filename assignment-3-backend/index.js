require("dotenv").config();
const express = require("express");
var cookieParser = require("cookie-parser");

// security

// routes
const routes = require("./routes/a3routes");

const port = process.env.PORT;
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Server is up and running!");
});

app.use("/", routes);

app.listen(port, "0.0.0.0", () => {
  console.log(`App listening!`);
});
