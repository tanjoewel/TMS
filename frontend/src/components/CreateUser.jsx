import React, { useState } from "react";
import { Button, TableRow, TableCell, TextField, Menu, MenuItem, Checkbox } from "@mui/material";

// this component is not really needed anymore, but it was good to test. It might get refactored into the CreateUser row, but other than that the logic for getting the users is in `Users`.
const User = (props) => {
  const ACCOUNT_STATUSES = ["Disabled", "Enabled"];

  // might be possible to get away with using this instead of the whole form object as a state.
  const [accountStatus, setAccountStatus] = useState(ACCOUNT_STATUSES[1]);

  const [groups, setGroups] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);

  const [openMenu, setOpenMenu] = useState(null);

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    email: "",
  });

  const dummyCreateUser = {
    username: "test1",
    password: "test",
    email: "test@dummy.com",
    // the group needs to be a drop down element with rows
    group: [],
  };

  async function handleCreateUserClick() {
    // TODO send an axios request to create a user, and also clear all the related states.

    // convert the accountStatus into a tinyint before sending to backend.
    const accountStatusTinyint = ACCOUNT_STATUSES.indexOf(accountStatus);
    const userObject = { username: userForm.username, password: userForm.password, email: userForm.email, groups, accountStatus: accountStatusTinyint };
    console.log(userObject, userObject.groups);
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

  return (
    <>
      <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }}>
        {/* Username cell */}
        <TableCell>
          <TextField
            label="Enter username"
            fullWidth={true}
            onChange={handleChange}
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
