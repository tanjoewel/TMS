import React, { useState } from "react";
import { Button, TableRow, TableCell, TextField, Menu, MenuItem, Checkbox, Snackbar, Alert } from "@mui/material";
import Axios from "axios";

// this component is not really needed anymore, but it was good to test. It might get refactored into the CreateUser row, but other than that the logic for getting the users is in `Users`.
const User = (props) => {
  const ACCOUNT_STATUSES = ["Disabled", "Enabled"];
  const SNACKBAR_SEVERITIES = props.SNACKBAR_SEVERITIES;

  const [accountStatus, setAccountStatus] = useState(ACCOUNT_STATUSES[1]);
  const [groups, setGroups] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    email: "",
  });

  // for snackbars
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState(SNACKBAR_SEVERITIES[0]);

  async function handleCreateUserClick() {
    // convert the accountStatus into a tinyint before sending to backend.
    const accountStatusTinyint = ACCOUNT_STATUSES.indexOf(accountStatus);
    const userObject = { username: userForm.username, password: userForm.password, email: userForm.email, groups, accountStatus: accountStatusTinyint };
    try {
      const result = await Axios.post("/users", userObject);

      // snackbar configuration
      setSnackbarSeverity(SNACKBAR_SEVERITIES[0]);
      setSnackbarMessage("User has been successfully created.");
      setSnackbarOpen(true);

      // reset everything only when user is successfully created
      setAccountStatus(ACCOUNT_STATUSES[1]);
      setGroups([]);
      setUserForm({
        username: "",
        password: "",
        email: "",
      });
    } catch (err) {
      const errorMessage = err.response.data.message;
      setSnackbarSeverity(SNACKBAR_SEVERITIES[1]);
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }

    return;
  }

  function handleDropDownClick(e, menuType) {
    setAnchorEl(e.currentTarget);
    setOpenMenu(openMenu === menuType ? null : menuType);
  }

  function handleCloseOutside() {
    setAnchorEl(null);
    setOpenMenu(null);
  }

  function handleStatusSelect(value) {
    setAccountStatus(value);
    setOpenMenu(null);
    setAnchorEl(null);
  }

  function handleGroupSelect(value) {
    // if the group is already in the array, we want to remove it. Remember we need to pass in a totally new object for useState and in-place mutations are not allowed.
    const index = groups.indexOf(value);
    if (index > -1) {
      const newGroups = groups.toSpliced(index, 1);
      setGroups(newGroups);
    } else {
      const newGroups = groups.concat([value]);
      setGroups(newGroups);
    }
    return;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCloseAlert(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  }

  return (
    <>
      {/* Snackbar component for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleCloseAlert} variant="filled" severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }}>
        {/* Username cell */}
        <TableCell>
          <TextField
            label="Enter username"
            fullWidth={true}
            onChange={handleChange}
            value={userForm.username}
            name="username"
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
            }}
          ></TextField>
        </TableCell>
        {/* Password cell */}
        <TableCell>
          <TextField
            label="Enter password"
            fullWidth={true}
            onChange={handleChange}
            value={userForm.password}
            name="password"
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
            label="Enter email"
            fullWidth={true}
            onChange={handleChange}
            value={userForm.email}
            name="email"
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
            }}
          ></TextField>
        </TableCell>
        {/* Group cell */}
        <TableCell>
          <Button
            id="groups"
            aria-controls={openMenu === "groups" ? "groups-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu === "groups" ? "true" : undefined}
            onClick={(event) => handleDropDownClick(event, "groups")}
            endIcon={openMenu === "groups" ? <img src="DropArrowUp.svg" /> : <img src="DropDownArrow.svg" />}
          >
            Groups
          </Button>
          <Menu id="groups-menu" open={openMenu === "groups"} anchorEl={anchorEl} onClose={handleCloseOutside}>
            {props.groups.map((item) => {
              return (
                <MenuItem key={item} onClick={() => handleGroupSelect(item)}>
                  {item}
                  <Checkbox checked={groups.includes(item)} />
                </MenuItem>
              );
            })}
          </Menu>
        </TableCell>
        {/* Account status cell */}
        <TableCell>
          <Button
            id="account-status"
            aria-controls={openMenu === "account-status" ? "account-status-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu === "account-status" ? "true" : undefined}
            onClick={(event) => handleDropDownClick(event, "account-status")}
            endIcon={openMenu === "account-status" ? <img src="DropArrowUp.svg" /> : <img src="DropDownArrow.svg" />}
          >
            {accountStatus || "Status"}
          </Button>
          <Menu id="account-status" open={openMenu === "account-status"} anchorEl={anchorEl} onClose={handleCloseOutside}>
            <MenuItem onClick={() => handleStatusSelect(ACCOUNT_STATUSES[1])}>Enabled</MenuItem>
            <MenuItem onClick={() => handleStatusSelect(ACCOUNT_STATUSES[0])}>Disabled</MenuItem>
          </Menu>
        </TableCell>
        {/* Create user cell */}
        <TableCell>
          <Button onClick={handleCreateUserClick}>Create</Button>
        </TableCell>
      </TableRow>
    </>
  );
};

export default User;
