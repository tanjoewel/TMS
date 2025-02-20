import { Grid2, Paper, Typography, Box, Button, StepConnector } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { STATE_OPEN, STATE_TODO, STATE_DOING, STATE_DONE, STATE_CLOSED } from "../StateEnums";
import Axios from "axios";

const Kanban = () => {
  /*
  TODOs for this page:
  1. Get all the tasks for the app
    1.5 Get the tasks state up and running, and the UI to use and manipulate that state
  2. Sort the tasks into its statuses
  3. Assign the tasks the plan colours
  4. Create task button (should be quite fast)
  */
  // dummy data just to make sure the UI works - this is not even in the right format actually
  const taskColumns = [
    { title: "OPEN", color: "#000", tasks: ["API for saving customer info", "Design UI/UX for mobile app"] },
    { title: "TO-DO", color: "#FFD700", tasks: ["Calculate salary", "Design UI/UX for floor plan", "API for serving coffee"] },
    { title: "DOING", color: "#32CD32", tasks: ["Find new hires"] },
    { title: "DONE", color: "#FFA500", tasks: ["API for making coffee"] },
    { title: "CLOSED", color: "#8A2BE2", tasks: ["Design UI/UX for coffees"] },
  ];

  const states = [STATE_OPEN, STATE_TODO, STATE_DOING, STATE_DONE, STATE_CLOSED];

  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const { acronym } = useParams();
  const navigate = useNavigate();

  async function getTasks() {
    const appTasks = await Axios.get(`/app/${acronym}/task`);
    setTasks(appTasks.data);
  }

  async function getPlans() {
    const appPlans = await Axios.get(`/app/${acronym}/plan`);
    setPlans(appPlans.data);
  }

  function getTasksByState(state) {
    const a = tasks.filter((task) => {
      return task.Task_state === state;
    });
    return a;
  }

  useEffect(() => {
    // get the tasks from app here, if it is not a valid acronym go to 404 not found as people can just directly enter the URL
    // i have to get plans as well so i know how to color them (maybe i can just do a joined query though) when i get all tasks from app
    const a = async () => {
      try {
        setLoading(true);
        await getTasks();
        await getPlans();
        setLoading(false);
      } catch (err) {
        if (err.code === 404) {
          navigate("/404");
        } else {
          console.log(err);
        }
      }
    };
    a();
  }, []);

  function handleTaskClick(event, task) {
    // the task here should return us the task id that then allows us to navigate into the task page
    console.log(event.target.value, task);
    alert("task button clicked");
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("GET TASK BY STATE: ", getTasksByState(STATE_OPEN));

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {/* Need app name here */}
        Task Board - {acronym}
      </Typography>

      <Button>Create Task</Button>

      {/* Task Board Grid */}
      <Box display={"flex"} justifyContent={"space-between"}>
        {states.map((state) => (
          <Paper elevation={3} sx={{ p: 2, minHeight: "60vh", display: "flex", flexDirection: "column" }} key={state}>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              {state}
            </Typography>

            {/* Task Cards */}

            {getTasksByState(state).map((task) => (
              <Paper
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  border: `2px solid gray`,
                  borderRadius: 1,
                }}
              >
                <Button onClick={(event) => handleTaskClick(event)}>{task.Task_name}</Button>
              </Paper>
            ))}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Kanban;
