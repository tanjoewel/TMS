import React from "react";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Header = () => {
  const navigate = useNavigate();

  const { isAuthenticated, logout, isAdmin, setIsAuthenticated, setIsAdmin, username } = useAuth();

  async function handleLogout(e) {
    try {
      await logout();
    } catch (err) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      console.log(err.message);
    }
  }

  function handleClickUser(e) {
    navigate("/users");
  }

  function handleClickTask(e) {
    navigate("/app");
  }

  function handleClickProfile(e) {
    navigate("/profile");
  }

  function handleClickTest(e) {
    navigate("/app/TMS1/task/TMS1_143");
  }

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Box style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Typography variant="h6" component="div" style={{ fontWeight: "bold" }}>
            Task Management System
          </Typography>
          {isAuthenticated ? (
            <Box style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Button color="inherit" variant="outlined" onClick={handleClickTask}>
                Task Management
              </Button>
              <Button color="inherit" variant="outlined" onClick={handleClickTest}>
                Test
              </Button>
              {isAdmin ? (
                <Button color="inherit" variant="outlined" onClick={handleClickUser}>
                  User Management
                </Button>
              ) : (
                <></>
              )}
            </Box>
          ) : (
            <></>
          )}
        </Box>
        {isAuthenticated ? (
          <Box style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Typography variant="body1">Logged in as: {username}</Typography>
            <Button variant="outlined" onClick={handleClickProfile}>
              Profile
            </Button>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <></>
        )}
      </Toolbar>
    </AppBar>
  );
};
export default Header;
