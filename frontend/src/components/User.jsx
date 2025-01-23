import React from "react";
import { Button, TableRow, TableCell, TextField, Menu } from "@mui/material";
import Axios from "axios";
import DropDown from "./DropDown";

// this component is not really needed anymore, but it was good to test. It might get refactored into the CreateUser row, but other than that the logic for getting the users is in `Users`.
const User = (props) => {
  const ACCOUNT_STATUSES = ["Enabled", "Disabled"];

  const dummyCreateUser = {
    username: "test1",
    password: "test",
    email: "test@dummy.com",
    // the group needs to be a drop down element with rows
    group: [],
  };

  async function handleClick() {
    // TODO send an axios request to create a group
    const result = await Axios.post("/users", dummyCreateUser);
    return;
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
        <TableCell>
          <DropDown items={props.group} multiSelect={true} buttonText="Group" />
        </TableCell>
        <TableCell>
          <DropDown items={ACCOUNT_STATUSES} multiSelect={false} buttonText="Status" />
        </TableCell>
        <TableCell>
          <Button onClick={handleClick}>Create</Button>
        </TableCell>
      </TableRow>
    </>
  );
};

export default User;
