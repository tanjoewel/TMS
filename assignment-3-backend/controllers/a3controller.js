exports.createTask = async function (req, res) {
  res.send("Create task");
};

exports.getTaskbyState = async function (req, res) {
  res.send("get task by state");
};

exports.promoteTask2Done = async function (req, res) {
  res.send("promote task 2 done");
};
