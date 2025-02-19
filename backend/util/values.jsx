{
  taskColumns.map((column, index) => (
    <>
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
    </>
  ));
}
