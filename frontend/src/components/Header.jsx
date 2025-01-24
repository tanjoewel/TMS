import React from "react";
import { Box, Button } from "@mui/material";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Header = (props) => {
  const navigate = useNavigate();

  const isLoggedIn = props.isLoggedIn;

  async function handleLogout(e) {
    try {
      const res = await Axios.post("/logout", {});
      if (res.status === 200) {
        props.setIsLoggedIn(false);
        navigate("/");
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <div>
      <Box
        component="section"
        sx={{ pl: 6, py: 2, backgroundColor: "#e9eaea", fontWeight: 800, fontSize: 24, display: "flex", justifyContent: "space-between" }}
      >
        Task Management System
        {isLoggedIn ? <Button onClick={handleLogout}>Logout</Button> : <></>}
      </Box>
    </div>
  );
};
export default Header;
