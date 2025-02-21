import { Paper, Typography, Box, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { STATE_OPEN, STATE_TODO, STATE_DOING, STATE_DONE, STATE_CLOSED } from "../StateEnums";
import Axios from "axios";
import CreatePlan from "../components/CreatePlan";
import { useAuth } from "../AuthContext";

const Kanban = () => {
  const states = [STATE_OPEN, STATE_TODO, STATE_DOING, STATE_DONE, STATE_CLOSED];

  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isPM, setIsPM] = useState(false);

  const [loading, setLoading] = useState(true);

  const { acronym } = useParams();
  const navigate = useNavigate();
  const { username } = useAuth();

  async function getTasks() {
    const appTasks = await Axios.get(`/app/${acronym}/task`);
    setTasks(appTasks.data);
  }

  async function getPlans() {
    const appPlans = await Axios.get(`/app/${acronym}/plan`);
    setPlans(appPlans.data);
  }

  async function getUserGroups() {
    try {
      const axiosResponse = await Axios.get(`/groups/${username}`);
      setIsPM(axiosResponse.data);
    } catch (err) {
      console.log(err);
    }
  }

  function getTasksByState(state) {
    const a = tasks.filter((task) => {
      return task.Task_state === state;
    });
    return a;
  }

  useEffect(() => {
    const a = async () => {
      try {
        setLoading(true);
        await getTasks();
        await getPlans();
        await getUserGroups();
        setLoading(false);
      } catch (err) {
        if (err.status === 404) {
          navigate("/404");
        } else {
          console.log(err);
        }
      }
    };
    a();
  }, []);

  function handleTaskClick(taskID) {
    navigate(`/app/${acronym}/task/${taskID}`);
  }

  function handleCreateTaskClick() {
    navigate(`/app/${acronym}/create`);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box display={"flex"} justifyContent={"space-between"} paddingBottom="20px">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {/* Need app name here */}
          Task Board - {acronym}
        </Typography>

        <Button onClick={handleCreateTaskClick} variant="contained">
          Create Task
        </Button>
      </Box>
      {/* Remember to make this only visible to user if it is hardcoded PM */}
      {isPM ? <CreatePlan /> : <></>}
      {/* Task Board Grid */}
      <Box display={"flex"} justifyContent={"space-between"} paddingTop="20px">
        {states.map((state) => (
          <Paper elevation={3} sx={{ p: 2, minHeight: "60vh", display: "flex", flexDirection: "column", width: `${(100 - 15) / states.length}%` }} key={state}>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              {state}
            </Typography>

            {/* Task Cards */}

            {getTasksByState(state).map((task) => (
              <Paper
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  border: `2px solid ${task.Plan_color}`,
                  borderRadius: 1,
                }}
                key={task.Task_id}
              >
                <Button onClick={() => handleTaskClick(task.Task_id)}>{task.Task_name}</Button>
              </Paper>
            ))}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Kanban;
