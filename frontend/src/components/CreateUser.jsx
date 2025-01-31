import React, { useState } from "react";
import { Button, TableRow, TableCell, TextField, Menu, MenuItem } from "@mui/material";
import Axios from "axios";
import DropDown from "./DropDown";

// this component is not really needed anymore, but it was good to test. It might get refactored into the CreateUser row, but other than that the logic for getting the users is in `Users`.
const User = (props) => {
  const ACCOUNT_STATUSES = ["Enabled", "Disabled"];

  const [accountStatus, setAccountStatus] = useState(ACCOUNT_STATUSES[0]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const dummyCreateUser = {
    username: "test1",
    password: "test",
    email: "test@dummy.com",
    // the group needs to be a drop down element with rows
    group: [],
  };

  async function handleCreateUserClick() {
    // TODO send an axios request to create a user
    console.log("asd");
    return;
  }

  function handleDropDownClick(e) {
    setAnchorEl(e.currentTarget);
  }

  function handleCloseOutside() {
    setAnchorEl(null);
  }

  function handleStatusSelect(value) {
    setAccountStatus(value);
    setAnchorEl(null);
  }

  return (
    <>
      <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }}>
        <TableCell>
          <TextField
            label="Enter username"
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
            label="Enter password"
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
            label="Enter email"
            fullWidth={true}
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
            }}
          ></TextField>
        </TableCell>
        {/* Group cell */}
        <TableCell>
          <DropDown items={props.group} multiSelect={true} buttonText="Group" />
        </TableCell>
        {/* Account status cell */}
        <TableCell>
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleDropDownClick}
            endIcon={open ? <img src="DropArrowUp.svg" /> : <img src="DropDownArrow.svg" />}
          >
            {accountStatus || "Status"}
          </Button>
          <Menu id="basic-button" open={open} anchorEl={anchorEl} onClose={handleCloseOutside}>
            <MenuItem onClick={() => handleStatusSelect(ACCOUNT_STATUSES[0])}>Enabled</MenuItem>
            <MenuItem onClick={() => handleStatusSelect(ACCOUNT_STATUSES[1])}>Disabled</MenuItem>
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
