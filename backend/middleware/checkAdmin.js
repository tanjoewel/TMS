// middleware to check if the currently logged in user is an admin.

const groupController = require("../controllers/groupController");

// if we reach this middleware, we know that the user is authenticated. so all we need to do is to check if the user is an admin

async function checkAdmin(req, res, next) {
  const username = req.decoded.username;
  // check if the user is an admin

  try {
    const isAdmin = await groupController.checkGroup(username, "admin");
    if (!isAdmin) {
      // user is not an admin, return 403. This is probably not a good idea security wise to send this message but I will leave it here for debug purposes.
      res.status(403).json({ message: "User is not an admin" });
      return;
    }

    // otherwise, this user is an admin and we go to the next middleware.
    next();
  } catch (err) {
    res.status(500).json({ message: "Error checking if user is an admin" });
    return;
  }
}

module.exports = checkAdmin;
