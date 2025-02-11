import React, { useState } from "react";
import { Button, TableRow, TableCell, TextField, MenuItem, Switch, FormControl, Select } from "@mui/material";
import Axios from "axios";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";

const User = (props) => {
  const [checked, setChecked] = useState(true);
  const [groups, setGroups] = useState([]);

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    email: "",
  });

  const { showSnackbar } = useSnackbar();

  async function handleCreateUserClick() {
    // convert the accountStatus into a tinyint before sending to backend.
    const accountStatusTinyint = checked ? 1 : 0;
    const userObject = { username: userForm.username, password: userForm.password, email: userForm.email, groups, accountStatus: accountStatusTinyint };
    try {
      const result = await Axios.post("/users/create", userObject);

      const snackbarMessage = "User has been successfully created.";
      showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[0]);
      props.setErrorMessage("");

      // reset everything only when user is successfully created
      setChecked(true);
      setGroups([]);
      setUserForm({
        username: "",
        password: "",
        email: "",
      });

      // re-render
      props.getUsers();
    } catch (err) {
      props.setErrorMessage(err.response.data.message);
      props.setShowError(true);
      // const errorMessage = err.response.data.message;
      // showSnackbar(errorMessage, SNACKBAR_SEVERITIES[1]);
    }

    return;
  }

  function handleSwitchChange(event) {
    setChecked(event.target.checked);
  }

  function handleGroupSelect(event) {
    const value = event.target.value;
    // if the group is already in the array, we want to remove it. Remember we need to pass in a totally new object for useState and in-place mutations are not allowed.
    setGroups(value);
    return;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" }, "& > td": { backgroundColor: "#e0e0e0" } }}>
        {/* Username cell */}
        <TableCell>
          <TextField
            placeholder="Enter username"
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
            placeholder="Enter password"
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
            placeholder="Enter email"
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
          <FormControl fullWidth>
            <Select multiple value={groups} onChange={handleGroupSelect} renderValue={(selected) => "Selected " + selected.length} displayEmpty>
              {props.groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        {/* Account status cell */}
        <TableCell>
          <Switch checked={checked} onChange={handleSwitchChange}></Switch>
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
