import { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Button,
  TableBody,
  TableHead,
  Table,
  TableContainer,
  TableRow,
  Paper,
  TableCell,
  MenuItem,
  Typography,
  Switch,
  FormControl,
  Select,
} from "@mui/material";
import CreateUser from "../components/CreateUser";
import Axios from "axios";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";

export default function Users() {
  const [groupname, setGroupname] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [errorMessage, setErrorMessage] = useState("lmao");
  const [showError, setShowError] = useState(false);

  const { showSnackbar } = useSnackbar();

  async function getUsers() {
    try {
      const users = await Axios.get("/users");
      setUsers(users.data);
    } catch (e) {
      showSnackbar("Error getting users", SNACKBAR_SEVERITIES[1]);
    }
  }

  async function getDistinctGroups() {
    try {
      const groups = await Axios.get("/groups");
      setGroups(groups.data);
    } catch (e) {
      showSnackbar("Error getting groups", SNACKBAR_SEVERITIES[1]);
    }
  }

  // when the page first loads, get the users from the database
  useEffect(() => {
    getUsers();
    getDistinctGroups();
  }, []);

  async function handleUpdateClick(index) {
    const userToUpdate = users[index];
    const userObject = {
      username: userToUpdate.username,
      password: userToUpdate.password || "",
      email: userToUpdate.email || "",
      groups: userToUpdate.groups,
      accountStatus: userToUpdate.enabled,
    };
    try {
      await Axios.put("/users", userObject);
      const snackbarMessage = "User has been successfully updated.";
      showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[0]);
      setErrorMessage("lmao");
      setShowError(false);
      await getUsers();
    } catch (err) {
      console.log(err);
      // const errorMessage = err.response.data.message;
      // showSnackbar(errorMessage, SNACKBAR_SEVERITIES[1]);
      setErrorMessage(err.response.data.message);
      setShowError(true);
    }
  }

  async function handleCreateClick() {
    // handling this on frontend because we don't need a call to the database! getDistinctGroups is updated consistently
    try {
      const result = await Axios.post("/groups/create", { groupname });
      setGroupname("");
      const snackbarMessage = "Group has successfully been created";
      showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[0]);
      await getDistinctGroups();
      setErrorMessage("lmao");
      setShowError(false);
    } catch (err) {
      setErrorMessage(err.response.data.message);
      setShowError(true);
      // showSnackbar(err.response.data.message, SNACKBAR_SEVERITIES[1]);
      console.log("Error creating group: ", err.response.data.message);
    }
  }

  function handleSwitchChange(event, index) {
    const tinyint = event.target.checked ? 1 : 0;
    const newUsers = users.map((user, i) => {
      return i === index ? { ...user, ["enabled"]: tinyint } : user;
    });
    setUsers(newUsers);
  }

  function handleChange(index, field, value) {
    const newUsers = users.map((user, i) => {
      return i === index ? { ...user, [field]: value } : user;
    });
    setUsers(newUsers);
  }

  function handleGroupSelect(index, event) {
    const value = event.target.value;
    const newUsers = users.map((user, i) => {
      return i === index ? { ...user, ["groups"]: value } : user;
    });
    setUsers(newUsers);
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
      <Typography sx={{ visibility: showError ? "visible" : "hidden" }} color="red" paddingLeft="26px" fontSize="20px">
        {errorMessage}
      </Typography>
      <Box sx={{ mx: 3, mt: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650, border: "1px solid black" }} aria-label="simple table" size="small">
            {/* Table header */}
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
            {/* Table body */}
            <TableBody>
              {/* Create user row */}
              <CreateUser groups={groups} getUsers={getUsers} setErrorMessage={setErrorMessage} setShowError={setShowError} />
              {/* Users rows */}
              {users.map((user, index) => {
                return (
                  <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }} key={user.username}>
                    {/* Username cell */}
                    <TableCell>
                      <Typography paddingLeft="14px">{user.username}</Typography>
                    </TableCell>
                    {/* Password cell */}
                    <TableCell>
                      <TextField
                        placeholder="Enter new password to edit"
                        fullWidth={true}
                        onChange={(e) => handleChange(index, "password", e.target.value)}
                        value={user.password ? user.password : ""}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "12px",
                          },
                        }}
                      ></TextField>
                    </TableCell>
                    {/* Email cell */}
                    <TableCell>
                      <TextField
                        placeholder="Enter email to update"
                        value={user.email ? user.email : ""}
                        fullWidth={true}
                        onChange={(e) => handleChange(index, "email", e.target.value)}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "12px",
                          },
                        }}
                      ></TextField>
                    </TableCell>
                    {/* Groups cell */}
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          multiple
                          value={user.groups}
                          onChange={(event) => handleGroupSelect(index, event)}
                          renderValue={(selected) => "Selected " + selected.length}
                          displayEmpty
                        >
                          {groups.map((group) => (
                            <MenuItem key={group} value={group} disabled={user.username === "ADMIN" && group === "admin"}>
                              {group}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    {/* Account status Cell */}
                    <TableCell>
                      <Switch checked={user.enabled} onChange={(event) => handleSwitchChange(event, index)} disabled={user.username === "ADMIN"}></Switch>
                    </TableCell>
                    {/* Action cell */}
                    <TableCell>
                      <Button onClick={() => handleUpdateClick(index)}>Update</Button>
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
