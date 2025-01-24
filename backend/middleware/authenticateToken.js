const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const cookies = req.headers.cookie;
  // need to parse this cookie
  // first split by the different cookies

  try {
    const token = parseCookies(cookies);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.decoded = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(403).send(err.message);
  }
}

function parseCookies(cookie) {
  const first_split = cookie.split(";");
  for (let i = 0; i < first_split.length; i++) {
    // split by the '=' to separate the name from the value
    const second_split = first_split[i].split("=");
    if (second_split[0] === "auth_token");
    return second_split[1];
  }
  throw new Error("No auth_token found");
}

module.exports = authenticateToken;
