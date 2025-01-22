import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { NavLink } from "react-router-dom";

const Home = () => {
  const LoginButton = styled(Button)({
    backgroundColor: "blue",
    fontSize: 16,
    border: "1px grey solid",
    color: "white",
    textTransform: "none",
  });

  function handleClick() {
    // TODO: submit the request to the backend here. Remember to hash the password before sending it to the backend. Do once backend is set up.
    console.log("Button clicked");
  }

  // TODO: client-side error validation. Do once backend is set up. Maybe refactor to use Immer and useReducer?
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <nav>
        <NavLink to="/users">Users</NavLink>
      </nav>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          gap: 2,
          textAlign: "center",
          minHeight: "300px",
        }}
      >
        <TextField
          id="username"
          label="Username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <TextField
          id="password"
          label="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <LoginButton onClick={handleClick} sx={{ width: "100px" }}>
          Login
        </LoginButton>
      </Box>
    </div>
  );
};

export default Home;
