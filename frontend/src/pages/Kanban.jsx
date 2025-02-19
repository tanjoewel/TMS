import { Grid2, Paper, Typography, Box, Button } from "@mui/material";
import React from "react";

const Kanban = () => {
  /*
  TODOs for this page:
  1. Get all the tasks for the app
    1.5 Get the tasks state up and running, and the UI to use and manipulate that state
  2. Sort the tasks into its statuses
  3. Assign the tasks the plan colours
  */
  // dummy data just to make sure the UI works - this is not even in the right format actually
  const taskColumns = [
    { title: "OPEN", color: "#000", tasks: ["API for saving customer info", "Design UI/UX for mobile app"] },
    { title: "TO-DO", color: "#FFD700", tasks: ["Calculate salary", "Design UI/UX for floor plan", "API for serving coffee"] },
    { title: "DOING", color: "#32CD32", tasks: ["Find new hires"] },
    { title: "DONE", color: "#FFA500", tasks: ["API for making coffee"] },
    { title: "CLOSED", color: "#8A2BE2", tasks: ["Design UI/UX for coffees"] },
  ];

  function handleTaskClick(event, task) {
    // the task here should return us the task id that then allows us to navigate into the task page
    console.log(event.target.value, task);
    alert("task button clicked");
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {/* Need app name here */}
        Task Board - namehere
      </Typography>

      {/* Task Board Grid */}
      <Grid2 container spacing={2} sx={{ mt: 2 }}>
        {taskColumns.map((column, index) => (
          <Grid2 item xs={12} sm={6} md={2.4} key={index}>
            {/* Column Container */}
            <Paper elevation={3} sx={{ p: 2, minHeight: "60vh", display: "flex", flexDirection: "column" }}>
              <Typography fontWeight="bold" sx={{ mb: 2 }}>
                {column.title}
              </Typography>

              {/* Task Cards */}
              {column.tasks.map((task, i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    border: `2px solid ${column.color}`,
                    borderRadius: 1,
                  }}
                >
                  <Button onClick={(event) => handleTaskClick(event, task)}>{task}</Button>
                </Paper>
              ))}
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default Kanban;
