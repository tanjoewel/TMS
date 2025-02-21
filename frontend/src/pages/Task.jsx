import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Select, Paper, Box, TextField, MenuItem } from "@mui/material";
import Axios from "axios";
import { useAuth } from "../AuthContext";
import { STATE_OPEN, STATE_TODO, STATE_DOING, STATE_DONE, STATE_CLOSED } from "../StateEnums";

const Task = (props) => {
  const { username } = useAuth();
  const [errorMessage, setErrorMessage] = useState("lmao");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState({
    Task_id: "dummy",
    Task_name: "",
    Task_description: "",
    Task_notes: [],
    Task_plan: "",
    Task_app_Acronym: "",
    Task_state: "CREATE",
    Task_creator: "",
    Task_owner: "",
    Task_createDate: "",
  });
  const [plans, setPlans] = useState([]);
  const [newNotes, setNewNotes] = useState("");
  const [updatePage, setUpdatePage] = useState(0);
  const [createTask, setCreateTask] = useState({
    task_name: "",
    task_description: "",
    task_plan: "",
    task_creator: username,
    task_owner: username,
  });

  // the URL here should contain both the app acronym and task ID
  const { acronym, taskID } = useParams();
  const navigate = useNavigate();
  const type = props.type;

  const colormap = ["green", "black"];
  const BUTTON_ACTIONS = {
    RELEASE: 1,
    WORK: 2,
    DEMOTE: 3,
    SEEK: 4,
    REJECT: 5,
    APPROVE: 6,
    UPDATE: 7,
    CREATE: 8,
  };

  const VIEW_TYPE = "view";
  const CREATE_TYPE = "create";

  async function getTask() {
    const getTasksResult = await Axios.get(`/app/${acronym}/task/${taskID}`);
    setTask(getTasksResult.data);
  }

  async function getPlans() {
    const getPlansResult = await Axios.get(`/app/${acronym}/plan`);
    const planMVPs = [];
    getPlansResult.data.forEach((plan) => {
      planMVPs.push(plan.Plan_MVP_name);
    });
    setPlans(planMVPs);
  }

  useEffect(() => {
    const a = async () => {
      try {
        setLoading(true);
        if (type === VIEW_TYPE) {
          await getTask();
        }
        await getPlans();
      } catch (err) {
        // only some kinds of error we want to route to 404, basically if the backend throws a 404 itself
        if (err.status === 404) {
          navigate("/404");
        } else {
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };
    a();
  }, [updatePage]);

  function handleSelectChange(event) {
    if (type === CREATE_TYPE) {
      setCreateTask((prev) => ({
        ...prev,
        ["task_plan"]: event.target.value,
      }));
    } else {
      setTask((prev) => ({
        ...prev,
        ["Task_plan"]: event.target.value,
      }));
    }
  }

  async function handleButtonClick(action) {
    const stateTransitionBody = {
      notesBody: newNotes,
      noteCreator: username,
    };
    const updateBody = { notesBody: newNotes, noteCreator: username, plan: task.Task_plan };
    try {
      switch (action) {
        case BUTTON_ACTIONS.RELEASE:
          await Axios.patch(`/app/${acronym}/task/release/${taskID}`, stateTransitionBody);
          break;
        case BUTTON_ACTIONS.WORK:
          await Axios.patch(`/app/${acronym}/task/work/${taskID}`, stateTransitionBody);
          break;
        case BUTTON_ACTIONS.DEMOTE:
          await Axios.patch(`/app/${acronym}/task/demote/${taskID}`, stateTransitionBody);
          break;
        case BUTTON_ACTIONS.SEEK:
          await Axios.patch(`/app/${acronym}/task/seek/${taskID}`, stateTransitionBody);
          break;
        case BUTTON_ACTIONS.REJECT:
          await Axios.patch(`/app/${acronym}/task/reject/${taskID}`, stateTransitionBody);
          break;
        case BUTTON_ACTIONS.APPROVE:
          await Axios.patch(`/app/${acronym}/task/approve/${taskID}`, stateTransitionBody);
          break;
        case BUTTON_ACTIONS.UPDATE:
          await Axios.patch(`/app/${acronym}/task/update/${taskID}`, updateBody);
          setNewNotes("");
          break;
        case BUTTON_ACTIONS.CREATE:
          await Axios.post(`/app/${acronym}/task/create`, createTask);
          break;
      }
      setUpdatePage((prev) => {
        return prev + 1;
      });
      setShowError(false);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.response.data.message);
      setShowError(true);
      // this will call the APIs which will cause protectedroutes to trigger if it is invalid jwt
      setUpdatePage((prev) => {
        return prev + 1;
      });
      console.log(err.response.data.message);
    }
  }

  // prevent rendering if loading is on so that things like the select element is synced.
  if (loading) {
    return <div>Loading...</div>;
  }

  // true if addNotes should be disabled
  const disableAddNotes = task.Task_state === STATE_CLOSED || type === CREATE_TYPE;
  // true if select plan should be disabled
  const disablePlanSelect = task.Task_state === STATE_CLOSED;

  return (
    <Box sx={{ py: 2, px: 5 }}>
      {/* Error message (this position is good) */}
      <Typography variant="body2" color="error" sx={{ visibility: showError ? "visible" : "hidden" }}>
        {errorMessage}
      </Typography>
      {/* Back button (this position is also good) */}
      <Button onClick={() => navigate(-1)}>{"< Back"}</Button>
      {/* Middle row */}
      <Box display={"flex"} justifyContent={"space-between"}>
        {/* this should all be one box */}
        <Box flex={1}>
          <Box display={"flex"} justifyContent={"space-between"}>
            {type === CREATE_TYPE ? (
              // Textfield to write the name
              <TextField
                placeholder="Enter task name"
                onChange={(event) =>
                  setCreateTask((prev) => ({
                    ...prev,
                    ["task_name"]: event.target.value,
                  }))
                }
              ></TextField>
            ) : (
              <>
                <Typography variant="h6" fontWeight="bold">
                  {task.Task_name}
                </Typography>
              </>
            )}

            <Typography variant="h6">{type === CREATE_TYPE ? "CREATE" : task.Task_state}</Typography>
          </Box>

          <Typography variant="body2">{task.Task_app_Acronym}</Typography>

          {/* Plan Field */}
          <Select
            disabled={disablePlanSelect}
            value={type === CREATE_TYPE ? createTask.task_plan : task.Task_plan}
            renderValue={(selected) => (selected ? selected : "select")}
            displayEmpty
            width={"50%"}
            onChange={handleSelectChange}
            sx={{ backgroundColor: disablePlanSelect ? "grey" : "white" }}
          >
            {plans.map((plan) => (
              <MenuItem key={plan} value={plan}>
                {plan}
              </MenuItem>
            ))}
          </Select>

          {/* Description Section */}
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            Description
          </Typography>
          <Paper sx={{ padding: 2, height: "250px", overflow: "auto", width: "100%" }}>
            {type === CREATE_TYPE ? (
              // For user to add their description
              <TextField
                placeholder="Enter task description here"
                fullWidth
                height="100%"
                sx={{
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
                variant="standard"
                InputProps={{ disableUnderline: true }}
                onChange={(event) => setCreateTask((prev) => ({ ...prev, ["task_description"]: event.target.value }))}
              ></TextField>
            ) : (
              <>
                <Typography>{task.Task_description}</Typography>
              </>
            )}
          </Paper>
        </Box>

        {/* Right Side: Notes History */}
        <Box flex={1} pl="100px">
          <Typography variant="h6">Notes History</Typography>
          <Paper sx={{ padding: 2, height: "300px", width: "100%", overflow: "auto", border: "1px solid #ddd" }}>
            {/* Can do a map that returns typography */}
            {task.Task_notes.map((note, i) => (
              <Typography key={i} color={colormap[note.type]}>{`${note.date_posted} ${note.type === 1 ? `(${note.creator})` : ""} ${note.text}`}</Typography>
            ))}
          </Paper>

          {/* Add Note Field */}
          <TextField
            fullWidth
            placeholder="Add a note..."
            sx={{
              marginTop: 1,
              border: "1px solid #ddd",
              padding: 1,
              verticalAlign: "top",
              whiteSpace: "normal",
              wordBreak: "break-word",
              height: "100px",
              backgroundColor: disableAddNotes ? "grey" : "white",
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            multiline
            value={newNotes}
            onChange={(event) => setNewNotes(event.target.value)}
            disabled={disableAddNotes}
          />
        </Box>
      </Box>

      {/* Footer Buttons */}
      <Box display={"flex"} justifyContent={"space-between"} paddingTop={"50px"}>
        {type === CREATE_TYPE ? (
          <Button variant="contained" onClick={() => handleButtonClick(BUTTON_ACTIONS.CREATE)}>
            Create task
          </Button>
        ) : (
          <>
            <Button
              variant="text"
              sx={{ visibility: task.Task_state !== STATE_OPEN ? "hidden" : "visible" }}
              onClick={() => handleButtonClick(BUTTON_ACTIONS.RELEASE)}
            >
              Release Task
            </Button>
            <Button
              variant="text"
              sx={{ visibility: task.Task_state !== STATE_TODO ? "hidden" : "visible" }}
              onClick={() => handleButtonClick(BUTTON_ACTIONS.WORK)}
            >
              Work On Task
            </Button>
            <Button
              variant="text"
              sx={{ visibility: task.Task_state !== STATE_DOING ? "hidden" : "visible" }}
              onClick={() => handleButtonClick(BUTTON_ACTIONS.DEMOTE)}
            >
              Return task to ToDo List
            </Button>
            <Button
              variant="text"
              sx={{ visibility: task.Task_state !== STATE_DOING ? "hidden" : "visible" }}
              onClick={() => handleButtonClick(BUTTON_ACTIONS.SEEK)}
            >
              Seek Approval
            </Button>
            <Button
              variant="text"
              sx={{ visibility: task.Task_state !== STATE_DONE ? "hidden" : "visible" }}
              onClick={() => handleButtonClick(BUTTON_ACTIONS.REJECT)}
            >
              Reject Task
            </Button>
            <Button
              variant="text"
              sx={{ visibility: task.Task_state !== STATE_DONE ? "hidden" : "visible" }}
              onClick={() => handleButtonClick(BUTTON_ACTIONS.APPROVE)}
            >
              Approve task
            </Button>
            <Button variant="contained" onClick={() => handleButtonClick(BUTTON_ACTIONS.UPDATE)}>
              Save Changes
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Task;
