import React from "react";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Header = (props) => {
  const navigate = useNavigate();

  const isLoggedIn = props.isLoggedIn;
  const isAdmin = props.isAdmin;

  async function handleLogout(e) {
    try {
      const res = await Axios.post("/logout", {});
      if (res.status === 200) {
        props.setIsLoggedIn(false);
        props.setIsAdmin(false);
        navigate("/");
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleClickUser(e) {
    navigate("/users");
  }

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <Box style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Typography variant="h6" component="div" style={{ fontWeight: "bold" }}>
            Task Management System
          </Typography>
          {isLoggedIn ? (
            <div>
              <Button color="inherit" variant="outlined">
                Task Management
              </Button>
              {isAdmin ? (
                <Button color="inherit" variant="outlined" onClick={handleClickUser}>
                  User Management
                </Button>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
        </Box>
        {isLoggedIn ? (
          <Box style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* <Typography variant="body1">Logged in as: &lt;username&gt;</Typography> */}
            {/* <Button variant="outlined">Profile</Button> */}
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
