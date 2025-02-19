import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Select, Paper, Box, TextField, MenuItem } from "@mui/material";
import Axios from "axios";

const Task = () => {
  /*
  TODOs for this component
  1. Get the task based on the task ID in the URL (done)
    1.5 Navigate to 404 if not a valid task or app ID (done)
  2. Get all plans (done)
  3. Format the task notes (fk this shit man) (done)
  4. Set the UI based on the state of the task
    4.1 Hiding/showing buttons based on state
    4.2 Disabling/enabling certain fields based on state (for user perms can rely on backend)
  5. Update task API
  6. Bottom button APIs
  7. Error message
  8. Create task page
  */
  const [errorMessage, setErrorMessage] = useState("Error message here");
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [plans, setPlans] = useState([]);

  // the URL here should contain both the app acronym and task ID
  const { acronym, taskID } = useParams();
  const navigate = useNavigate();

  const colormap = ["green", "black"];

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
      // idk if this will ever happen because it should always exist otherwise this component will not be loaded.
      if (!(acronym && taskID)) {
        navigate("/404");
      }
      try {
        await getPlans();
        await getTask();
        setLoading(false);
      } catch (err) {
        // only some kinds of error we want to route to 404, basically if the backend throws a 404 itself
        if (err.code === 404) {
          navigate("/404");
        } else {
          console.log(err);
        }
      }
    };
    a();
  }, []);

  function handleSelectChange(event) {
    setTask((prev) => ({
      ...prev,
      ["Task_plan"]: event.target.value,
    }));
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ py: 2, px: 5 }}>
      {/* Error message (this position is good) */}
      <Typography variant="body2" color="error">
        {errorMessage}
      </Typography>
      {/* Back button (this position is also good) */}
      <Button onClick={() => navigate(-1)}>{"< Back"}</Button>
      {/* Middle row */}
      <Box display={"flex"} justifyContent={"space-between"}>
        {/* this should all be one box */}
        <Box flex={1}>
          <Box display={"flex"} justifyContent={"space-between"}>
            <Typography variant="h6" fontWeight="bold">
              {task.Task_name}
            </Typography>
            <Typography variant="h6">{task.Task_state}</Typography>
          </Box>

          <Typography variant="body2">{task.Task_app_Acronym}</Typography>

          {/* Plan Field (Change this to a SELECT) */}
          <Select value={task.Task_plan} renderValue={(selected) => (selected ? selected : "select")} displayEmpty width={"50%"} onChange={handleSelectChange}>
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
            <Typography>{task.Task_description}</Typography>
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
            sx={{ marginTop: 1, border: "1px solid #ddd", padding: 1, verticalAlign: "top", whiteSpace: "normal", wordBreak: "break-word", height: "100px" }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            multiline
          />
        </Box>
      </Box>

      {/* Footer Buttons */}
      <Box display={"flex"} justifyContent={"space-between"} paddingTop={"50px"}>
        <Button variant="text">Release Task</Button>
        <Button variant="text">Work On Task</Button>
        <Button variant="text">Return task to ToDo List</Button>
        <Button variant="text">Seek Approval</Button>
        <Button variant="text">Reject Task</Button>
        <Button variant="text">Approve task</Button>
        <Button variant="contained">Save Changes</Button>
      </Box>
    </Box>
  );
};

export default Task;
