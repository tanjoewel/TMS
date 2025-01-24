import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:8080";
Axios.defaults.withCredentials = true;

const Home = (props) => {
  const navigate = useNavigate();
  const LoginButton = styled(Button)({
    backgroundColor: "blue",
    fontSize: 16,
    border: "1px grey solid",
    color: "white",
    textTransform: "none",
  });

  // TODO: client-side error validation. Do once backend is set up. Maybe refactor to use Immer and useReducer?
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleClick() {
    try {
      const res = await Axios.post("/login", { username, password });
      props.setIsLoggedIn(true);
      if (res.status === 200) {
        if (res.data.isAdmin) {
          props.setIsAdmin(true);
        }
        navigate("/tasks");
      }
    } catch (e) {
      console.log(e);
    }
    setUsername("");
    setPassword("");
  }

  return (
    <div>
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
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <TextField
          id="password"
          label="Password"
          value={password}
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
