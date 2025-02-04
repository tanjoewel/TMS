const jwt = require("jsonwebtoken");
const { getUser } = require("../util/commonQueries");

async function authenticateToken(req, res, next) {
  const cookies = req.headers.cookie;
  // need to parse this cookie
  // first split by the different cookies

  try {
    const token = parseCookies(cookies);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.decoded = decoded;

    // after decoding, check if user exists in the database, then check that the ip and browser type after decoding is the same as in the request header.

    // check if user exists in the database
    const { username, ip, userAgent } = decoded;
    const result = await getUser(username);
    if (result.length === 0) {
      // res.status(403).send("An error has occured, please login again.");
      res.status(403).send("Invalid JWT token: username does not exist in the database");
      return;
    }

    // check if user is disabled
    const isEnabled = result[0].user_enabled;
    if (!isEnabled) {
      res.status(403).send("User is not enabled. Please contact your administrator.");
      return;
    }

    // check ip and browser type. this should prevent token spoofing using postman to directly access the backend as the userAgent will change.

    const ipFromReq = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const browserFromReq = req.headers["user-agent"];
    if (ip !== ipFromReq) {
      // res.status(403).send("An error has occured, please login again.");
      res.status(403).send("Invalid JWT token: ip from request does not match ip from token");
    }

    if (browserFromReq !== userAgent) {
      // res.status(403).send("An error has occured, please login again.");
      res.status(403).send("Invalid JWT token: browser type from request does not match browser type from token");
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(403).send(err.message);
  }
}

function parseCookies(cookie) {
  if (!cookie) {
    // throw new Error("An error has occured, please login again.");
    throw new Error("No cookie");
  }
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
