import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { TextField, Box, Button, TableBody, TableHead, Table, TableContainer, TableRow, Paper, TableCell } from "@mui/material";
import User from "../components/User";
import Axios from "axios";

export default function Users() {
  const [groupname, setGroupname] = useState("");

  // when the page first loads, get the users from the database
  useEffect(() => {
    async function getUsers() {
      try {
        const result = await Axios.get("http://localhost:8080");
        console.log(result);
      } catch (e) {
        console.log("Error getting users");
      }
    }
    getUsers();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <nav>
        <NavLink to="/">Back to login</NavLink>
      </nav>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 5 }}>
        <h2>Users</h2>
        <div>
          <TextField
            id="groupname"
            label="Group name"
            size="small"
            onChange={(e) => {
              setGroupname(e.target.value);
            }}
          />
          <Button>Create</Button>
        </div>
      </Box>
      <Box sx={{ mx: 3, mt: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650, border: "1px solid black" }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow sx={{ "& > th:not(:last-child)": { borderRight: "1px solid black" }, borderBottom: "2px solid black" }}>
                <TableCell label={"username"}>Username</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Account status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <User />
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

("display: flex; justify-content: space-between; align-items: center; width:100% ");
