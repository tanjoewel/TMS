import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Select, Paper, Box, TextField, MenuItem } from "@mui/material";
import Axios from "axios";

const Task = () => {
  /*
  TODOs for this component
  1. Get the task based on the task ID in the URL
    1.5 Navigate to 404 if not a valid task or app ID
  2. Get all plans
  3. Format the task notes (fk this shit man)
  4. Set the UI based on the state of the task
  */
  const [errorMessage, setErrorMessage] = useState("Error message here");
  const [task, setTask] = useState([]);
  const [plans, setPlans] = useState([]);

  // the URL here should contain both the app acronym and task ID
  const { acronym, taskID } = useParams();
  const navigate = useNavigate();

  async function getTask() {
    const getTasksResult = await Axios.get(`/app/${acronym}/task`);
    // may need some formatting here
    setTask(getTasksResult);
  }

  async function getPlans() {
    const getPlansResult = await Axios.get(`/app/${acronym}/plan`);
    // also may need some formatting here
    const planMVPs = [];
    getPlansResult.data.forEach((plan) => {
      planMVPs.push(plan.Plan_MVP_name);
    });
    // console.log(planMVPs);
    setPlans(planMVPs);
  }

  useEffect(() => {
    // idk if this will ever happen because it should always exist otherwise this component will not be loaded.
    if (!(acronym && taskID)) {
      navigate("/404");
    }
    console.log("use effect in task jsx", acronym, taskID);
    try {
      getPlans();
      getTasks();
    } catch (err) {
      // only some kinds of error we want to route to 404, basically if the backend throws a 404 itself
      if (err.statusCode === 404) {
        navigate("/404");
      }
    }
  }, []);

  return (
    <Box sx={{ py: 2, px: 5 }}>
      {/* Error message (this position is good) */}
      <Typography variant="body2" color="error">
        {errorMessage}
      </Typography>
      {/* Back button (this position is also good) */}
      <Button>{"< Back"}</Button>
      {/* Middle row */}
      <Box display={"flex"} justifyContent={"space-between"}>
        {/* this should all be one box */}
        <Box flex={1}>
          <Box display={"flex"} justifyContent={"space-between"}>
            <Typography variant="h6" fontWeight="bold">
              Task name here
            </Typography>
            <Typography variant="h6">Task state here</Typography>
          </Box>

          <Typography variant="body2">Task app acronym here</Typography>

          {/* Plan Field (Change this to a SELECT) */}
          <Select value={"mvp1"} renderValue={(selected) => (selected ? selected : "select")} displayEmpty width={"50%"}>
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
            <Typography multiline>
              App description here, might need to add text wrapping to the paper component above aaa aaa aaa. actually seems kind of fine
            </Typography>
          </Paper>
        </Box>

        {/* Right Side: Notes History */}
        <Box flex={1} pl="100px">
          <Typography variant="h6">Notes History</Typography>
          <Paper sx={{ padding: 2, height: "300px", width: "100%", overflow: "auto", border: "1px solid #ddd" }}>
            {/* Can do a map that returns typography */}
            <Typography sx={{ color: "green" }}>2025/25/12 09:00 | OPEN (pj): Created task</Typography>
            <Typography sx={{ color: "blue" }}>2025/26/12 15:00 | DOING (dev1): Working on task</Typography>
            <Typography sx={{ color: "red" }}>2025/27/12 12:00 | CLOSED (pj): Approved task</Typography>
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
        <Button variant="text">Work On Task</Button>
        <Button variant="contained">Save Changes</Button>
      </Box>
    </Box>
  );
};

export default Task;
