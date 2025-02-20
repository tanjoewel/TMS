const { executeQuery, createQueryBuilder, updateQueryBuilder } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");

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

  // validation (oh boy theres alot of them)
  const mandatoryFields = ["app_rNumber", "app_acronym"];
  let anyEmptyFields = false;
  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    if (isValueEmpty(req.body[field])) {
      res.status(400).json({ message: `${field} must not be empty` });
      anyEmptyFields = true;
      break;
    }
  }
  if (anyEmptyFields) {
    return;
  }

  if (app_rNumber < 0) {
    res.status(400).json({ message: "App running number must not be negative" });
    return;
  }

  if (app_acronym.length > 20) {
    res.status(400).json({ message: "App acronym must be between 1 and 20 characters inclusive" });
    return;
  }

  if (app_description.length > 1000) {
    res.status(400).json({ message: "App description must be less than 1000 characters" });
    return;
  }

  const alphanumericRegex = /^[0-9a-zA-Z]+$/;
  if (!app_acronym.match(alphanumericRegex)) {
    res.status(400).json({ message: "App acronym must only contain alphanumeric characters" });
    return;
  }

  const dateRegex = /^(18|19|20|21)\d{2}-(0[1-9]|1[1,2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!app_startDate.match(dateRegex)) {
    res.status(400).json({ message: "Start date must be of the form 'YYYY-MM-DD'" });
    return;
  }

  if (!app_endDate.match(dateRegex)) {
    res.status(400).json({ message: "End date must be of the form 'YYYY-MM-DD'" });
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

exports.updateApplication = async function (req, res) {
  // all fields except for acronym and RNumber are editable and are all optional
  const { acronym } = req.params;
  const {
    appDescription: app_description,
    appStartDate: app_startDate,
    appEndDate: app_endDate,
    appPermitCreate: app_permit_create,
    appPermitOpen: app_permit_open,
    appPermitToDoList: app_permit_toDoList,
    appPermitDoing: app_permit_doing,
    appPermitDone: app_permit_done,
  } = req.body;

  const updateBuilderArgs = [];
  const values = [];

  const argsArray = [app_description, app_startDate, app_endDate, app_permit_create, app_permit_open, app_permit_toDoList, app_permit_doing, app_permit_done];
  const columnNamesArray = [
    "app_description",
    "app_startDate",
    "app_endDate",
    "app_permit_create",
    "app_permit_open",
    "app_permit_toDoList",
    "app_permit_doing",
    "app_permit_done",
  ];

  if (app_description) {
    if (app_description.length > 65536) {
      res.status(400).json({ message: "App description must be less than 65536 characters long" });
      return;
    }
  }

  for (let i = 0; i < argsArray.length; i++) {
    if (argsArray[i]) {
      updateBuilderArgs.push(columnNamesArray[i]);
      values.push(argsArray[i]);
    }
  }
  values.push(acronym);

  const updateQuery = updateQueryBuilder("application", "app_acronym", updateBuilderArgs);
  try {
    const updateResult = await executeQuery(updateQuery, values);
    res.send("Application successfully updated");
  } catch (err) {
    const errorCode = err.code || 500;
    res.status(errorCode).json({ message: "Error updating application: " + err.message });
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
      error.code = 404;
      throw error;
    }
    return result;
  } catch (err) {
    const error = new Error("Error getting application: " + err.message);
    error.code = err.code || 500;
    throw error;
  }
};
