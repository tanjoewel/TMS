import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { TextField, Box, Button, TableBody, TableHead, Table, TableContainer, TableRow, Paper, TableCell } from "@mui/material";
import CreateUser from "../components/CreateUser";
import Axios from "axios";
import { useAuth } from "../AuthContext";

export default function Users() {
  const [groupname, setGroupname] = useState("");
  const [users, setUsers] = useState([]);
  const [group, setGroups] = useState([]);
  const [groupCounter, setGroupCounter] = useState(0);
  const { logout } = useAuth();

  // when the page first loads, get the users from the database
  useEffect(() => {
    async function getUsers() {
      try {
        const users = await Axios.get("/users");
        setUsers(users.data);
      } catch (e) {
        await logout();
        console.log("Error getting users");
      }
    }
    getUsers();
  }, []);

  // whenever we create a group, update the groups immediately
  useEffect(() => {
    async function getDistinctGroups() {
      try {
        const groups = await Axios.get("/groups");
        setGroups(groups.data);
      } catch (e) {
        await logout();
        console.log("Error getting groups");
      }
    }
    getDistinctGroups();
  }, [groupCounter]);

  async function handleUpdateClick() {
    // TODO send a request to the backend to update the user
    console.log("clicked");
  }

  // if got time need to improve user experience, such as providing feedback if it worked/did not work and clear the field once it is created
  async function handleCreateClick() {
    try {
      const result = await Axios.post("/groups/create", { groupname });
      setGroupname("");
      setGroupCounter((a) => a + 1);
    } catch (err) {
      console.log("Error creating group");
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 5 }}>
        <h2>User Management</h2>
        <div>
          <TextField
            id="groupname"
            label="Group name"
            size="small"
            value={groupname}
            onChange={(e) => {
              setGroupname(e.target.value);
            }}
          />
          <Button onClick={handleCreateClick}>Create</Button>
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
              <CreateUser group={group} />
              {users.map((row) => {
                return (
                  <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }} key={row.user_username}>
                    <TableCell>{row.user_username}</TableCell>
                    <TableCell>
                      <TextField
                        label="Enter new password to edit"
                        fullWidth={true}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "12px",
                          },
                        }}
                      ></TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Enter email to update"
                        value={row.user_email ? row.user_email : ""}
                        fullWidth={true}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "12px",
                          },
                        }}
                      ></TextField>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{row.user_enabled}</TableCell>
                    <TableCell>
                      <Button onClick={handleUpdateClick}>Update</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
