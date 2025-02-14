const { executeQuery, createQueryBuilder } = require("../util/sql");

exports.createApplication = async function (req, res) {
  // extract the request body. This will need some effort to sync with the frontend
  // Can destructure and rename in the same line like:
  // const {appAcronym: app_acronym, appDescription: app_description} = req.body;
  const {
    app_acronym,
    app_description,
    app_rNumber,
    app_startDate,
    app_endDate,
    app_permit_create,
    app_permit_open,
    app_permit_toDoList,
    app_permit_doing,
    app_permit_done,
  } = req.body;

  if (!app_acronym) {
    res.status(400).json({ message: "App acronym must be provided" });
    return;
  }

  if (!app_rNumber) {
    res.status(400).json({ message: "App running number must be provided" });
    return;
  }

  const query = createQueryBuilder("application", [
    "app_acronym",
    "app_description",
    "app_rNumber",
    "app_startDate",
    "app_endDate",
    "app_permit_create",
    "app_permit_open",
    "app_permit_toDoList",
    "app_permit_doing",
    "app_permit_done",
  ]);

  try {
    const result = await executeQuery(query, [
      app_acronym,
      app_description,
      app_rNumber,
      app_startDate,
      app_endDate,
      app_permit_create,
      app_permit_open,
      app_permit_toDoList,
      app_permit_doing,
      app_permit_done,
    ]);
    res.send("Application successfully created");
  } catch (err) {
    res.status(500).json({ message: "Error creating application: " + err.message });
  }
};

exports.getAllApplications = async function (req, res) {
  // might want to modify this query to rename the fields later on.
  const query = "SELECT * FROM application;";

  try {
    const result = await executeQuery(query);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting all the applications: " } + err.message);
  }
};

exports.getApplicationRoute = async function (req, res) {
  const appAcronym = req.params.acronym;
  try {
    const result = await exports.getApplication(appAcronym);
    res.send(result);
  } catch (err) {
    res.status(err.code).json({ message: err.message });
  }
};

exports.getApplication = async function (acronym) {
  const query = "SELECT * FROM application WHERE (app_acronym = ?)";
  if (acronym.trim().length === 0) {
    const error = new Error("App acronym cannot be empty");
    error.code = 400;
    throw error;
  }
  try {
    const result = await executeQuery(query, [acronym]);
    if (result.length === 0) {
      const error = new Error("There is no app with such an acronym");
      error.code = 400;
      throw error;
    }
    return result;
  } catch (err) {
    const error = new Error("Error getting application: " + err.message);
    error.code = err.code || 500;
    throw error;
  }
};
