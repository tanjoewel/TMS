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
  Menu,
  MenuItem,
  Checkbox,
  Typography,
  Switch,
} from "@mui/material";
import CreateUser from "../components/CreateUser";
import Axios from "axios";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";

export default function Users() {
  const [groupname, setGroupname] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  // for dropdowns
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenu, setOpenMenu] = useState({ type: null, index: null });

  const [errorMessage, setErrorMessage] = useState("");

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
      username: userToUpdate.user_username,
      password: userToUpdate.user_password || "",
      email: userToUpdate.user_email,
      groups: userToUpdate.groups,
      accountStatus: userToUpdate.user_enabled,
    };
    try {
      await Axios.put("/users", userObject);
      const snackbarMessage = "User has been successfully updated.";
      showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[0]);
      setErrorMessage("");
      await getUsers();
    } catch (err) {
      console.log(err);
      // const errorMessage = err.response.data.message;
      // showSnackbar(errorMessage, SNACKBAR_SEVERITIES[1]);
      setErrorMessage(err.response.data.message);
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
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.response.data.message);
      // showSnackbar(err.response.data.message, SNACKBAR_SEVERITIES[1]);
      console.log("Error creating group: ", err.response.data.message);
    }
  }

  function handleDropDownClick(e, type, index) {
    setAnchorEl(e.currentTarget);
    setOpenMenu({ type, index });
  }

  function handleCloseOutside() {
    setAnchorEl(null);
    setOpenMenu({ type: null, index: null });
  }

  function handleSwitchChange(event, index) {
    const tinyint = event.target.checked ? 1 : 0;
    const newUsers = users.map((user, i) => {
      return i === index ? { ...user, ["user_enabled"]: tinyint } : user;
    });
    setUsers(newUsers);
  }

  function handleChange(index, field, value) {
    const newUsers = users.map((user, i) => {
      return i === index ? { ...user, [field]: value } : user;
    });
    setUsers(newUsers);
  }

  function handleGroupSelect(index, value) {
    // get the user's groups first
    const userGroups = users[index].groups;
    // if the group is already in the array, we want to remove it.
    const groupIndex = userGroups.indexOf(value);
    if (groupIndex > -1) {
      const newGroups = userGroups.toSpliced(groupIndex, 1);
      // set the new groups
      const newUsers = users.map((user, i) => {
        return i === index ? { ...user, ["groups"]: newGroups } : user;
      });
      setUsers(newUsers);
    } else {
      const newGroups = userGroups.concat([value]);
      const newUsers = users.map((user, i) => {
        return i === index ? { ...user, ["groups"]: newGroups } : user;
      });
      setUsers(newUsers);
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
      <Typography color="red" paddingLeft="26px" fontSize="20px">
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
              <CreateUser groups={groups} getUsers={getUsers} setErrorMessage={setErrorMessage} />
              {/* Users rows */}
              {users.map((user, index) => {
                return (
                  <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }} key={user.user_username}>
                    {/* Username cell */}
                    <TableCell>
                      <Typography paddingLeft="14px">{user.user_username}</Typography>
                    </TableCell>
                    {/* Password cell */}
                    <TableCell>
                      <TextField
                        placeholder="Enter new password to edit"
                        fullWidth={true}
                        onChange={(e) => handleChange(index, "user_password", e.target.value)}
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
                        value={user.user_email ? user.user_email : ""}
                        fullWidth={true}
                        onChange={(e) => handleChange(index, "user_email", e.target.value)}
                        sx={{
                          "& .MuiInputLabel-root": {
                            fontSize: "12px",
                          },
                        }}
                      ></TextField>
                    </TableCell>
                    {/* Groups cell */}
                    <TableCell>
                      <Button
                        id="groups"
                        aria-controls={openMenu.type === "groups" && openMenu.index === index ? "groups-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu.type === "groups" && openMenu.index === index ? "true" : undefined}
                        onClick={(event) => handleDropDownClick(event, "groups", index)}
                        endIcon={openMenu.type === "groups" && openMenu.index === index ? <img src="DropArrowUp.svg" /> : <img src="DropDownArrow.svg" />}
                      >
                        Groups
                      </Button>
                      <Menu id="groups-menu" open={openMenu.type === "groups" && openMenu.index === index} anchorEl={anchorEl} onClose={handleCloseOutside}>
                        {groups.map((item) => {
                          return (
                            <MenuItem key={item} onClick={() => handleGroupSelect(index, item)} disabled={user.user_username === "ADMIN" && item === "admin"}>
                              {item}
                              <Checkbox checked={user.groups.includes(item)} />
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </TableCell>
                    {/* Account status Cell */}
                    <TableCell>
                      <Switch
                        checked={user.user_enabled}
                        onChange={(event) => handleSwitchChange(event, index)}
                        disabled={user.user_username === "ADMIN"}
                      ></Switch>
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
