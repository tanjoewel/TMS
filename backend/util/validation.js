exports.validateFields = (username, password, res) => {
  // check if username contains any special characters (this regex in particular also makes sure it cannot be empty)
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  const isUsernameMatch = username.match(alphanumericRegex);
  if (!isUsernameMatch) {
    res.status(400).json({ message: "Username cannot contain special characters or be empty." });
    return false;
  }

  // password validation. The regex below checks for the following:
  // Between 8 to 10 characters, must not contain spaces, must have at least one alphabet, number and special character
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,10}$/;
  const isPasswordMatch = password.match(passwordRegex);
  if (!isPasswordMatch) {
    res.status(400).json({
      message: "Password has to be between 8-10 characters and has to be alphanumeric with special characters.",
    });
    return false;
  }
  return true;
};

// thanks chatgpt
exports.isValueEmpty = function (value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
};

// i wish it was more extensible than this but i dont think its possible
exports.checkLength = function (value, length) {
  return value.length < length;
};
