const { executeQuery, createQueryBuilder, updateQueryBuilder } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");

exports.createApplication = async function (req, res) {
  // extract the request body. This will need some effort to sync with the frontend
  // Can destructure and rename in the same line like:
  // const {appAcronym: App_Acronym, appDescription: App_Description} = req.body;
  const {
    App_Acronym,
    App_Description,
    App_Rnumber,
    App_startDate,
    App_endDate,
    App_permit_Create,
    App_permit_Open,
    App_permit_toDoList,
    App_permit_Doing,
    App_permit_Done,
  } = req.body;

  // validation (oh boy theres alot of them)
  const mandatoryFields = ["App_Rnumber", "App_Acronym"];
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

  if (App_Rnumber < 0) {
    res.status(400).json({ message: "App running number must not be negative" });
    return;
  }

  if (App_Acronym.length > 20) {
    res.status(400).json({ message: "App acronym must be between 1 and 20 characters inclusive" });
    return;
  }

  if (App_Description.length > 1000) {
    res.status(400).json({ message: "App description must be less than 1000 characters" });
    return;
  }

  const alphanumericRegex = /^[0-9a-zA-Z]+$/;
  if (!App_Acronym.match(alphanumericRegex)) {
    res.status(400).json({ message: "App acronym must only contain alphanumeric characters" });
    return;
  }

  const dateRegex = /^(18|19|20|21)\d{2}-(0[1-9]|1[1,2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!App_startDate.match(dateRegex)) {
    res.status(400).json({ message: "Start date must be of the form 'YYYY-MM-DD'" });
    return;
  }

  if (!App_endDate.match(dateRegex)) {
    res.status(400).json({ message: "End date must be of the form 'YYYY-MM-DD'" });
    return;
  }

  const query = createQueryBuilder("application", [
    "App_Acronym",
    "App_Description",
    "App_Rnumber",
    "App_startDate",
    "App_endDate",
    "App_permit_Create",
    "App_permit_Open",
    "App_permit_toDoList",
    "App_permit_Doing",
    "App_permit_Done",
  ]);

  try {
    const result = await executeQuery(query, [
      App_Acronym,
      App_Description,
      App_Rnumber,
      App_startDate,
      App_endDate,
      App_permit_Create,
      App_permit_Open,
      App_permit_toDoList,
      App_permit_Doing,
      App_permit_Done,
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
    appDescription: App_Description,
    appStartDate: App_startDate,
    appEndDate: App_endDate,
    appPermitCreate: App_permit_Create,
    appPermitOpen: App_permit_Open,
    appPermitToDoList: App_permit_toDoList,
    appPermitDoing: App_permit_Doing,
    appPermitDone: App_permit_Done,
  } = req.body;

  const updateBuilderArgs = [];
  const values = [];

  const argsArray = [App_Description, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done];
  const columnNamesArray = [
    "App_Description",
    "App_startDate",
    "App_endDate",
    "App_permit_Create",
    "App_permit_Open",
    "App_permit_toDoList",
    "App_permit_Doing",
    "App_permit_Done",
  ];

  if (App_Description) {
    if (App_Description.length > 65536) {
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

  const updateQuery = updateQueryBuilder("application", "App_Acronym", updateBuilderArgs);
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
  const query = "SELECT * FROM application WHERE (App_Acronym = ?)";
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
