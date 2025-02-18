import React, { useState } from "react";
import { TextField, Button, Box, Typography, IconButton, InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { useAuth } from "../AuthContext";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";
Axios.defaults.baseURL = "http://localhost:8080";
Axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const { login, setIsAuthenticated, setIsAdmin } = useAuth();
  const LoginButton = styled(Button)({
    backgroundColor: "blue",
    fontSize: 16,
    border: "1px grey solid",
    color: "white",
    textTransform: "none",
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("testdefaultlol");
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSnackbar } = useSnackbar();

  async function handleClick() {
    try {
      const res = await Axios.post("/login", { username, password });
      if (res.status === 200) {
        await login(res.data.username);
        if (res.data.isAdmin) {
          setIsAdmin(true);
        }
        navigate("/tasks");
      }
    } catch (e) {
      // const snackbarMessage = "Invalid login. Please try again.";
      // showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[1]);
      setErrorMessage("Invalid login. Please try again.");
      setShowError(true);
      console.log(e);
      // not sure if i want to do this
      setUsername("");
      setPassword("");
    }
  }

  function handleTogglePassword() {
    setShowPassword((prev) => !prev);
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
          sx={{
            width: "250px",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleClick(); // Call the same function as the button
            }
          }}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <TextField
          id="password"
          label="Password"
          value={password}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleClick(); // Call the same function as the button
            }
          }}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          sx={{
            width: "250px",
          }}
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label={showPassword ? "hide the password" : "display the password"} onClick={handleTogglePassword} edge="end">
                  {showPassword ? <img src="Visibility.svg" /> : <img src="VisibilityOff.svg" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Typography sx={{ visibility: showError ? "visible" : "hidden" }} color="red" textAlign="center" pt="10px">
          {errorMessage}
        </Typography>
        <LoginButton onClick={handleClick} sx={{ width: "100px" }}>
          Login
        </LoginButton>
      </Box>
    </div>
  );
};

export default Login;
