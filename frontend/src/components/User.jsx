import React from "react";
import { Button, TableRow, TableCell } from "@mui/material";
import Axios from "axios";

// this component is not really needed anymore, but it was good to test. It might get refactored into the CreateUser row, but other than that the logic for getting the users is in `Users`.
const User = () => {
  const dummyuser = {
    username: "test1",
    password: "test",
    email: "test@dummy.com",
    // the group needs to be a drop down element with rows
    group: "example",
    accountStatus: "enabled",
    action: "create",
  };

  function handleClick() {
    // TODO send an axios request to create a group
    return;
  }

  // doing it like this to make it more extensible
  const usersArray = [dummyuser];

  return (
    <>
      {usersArray.map((row) => {
        return (
          <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }} key={row.username}>
            <TableCell>{row.username}</TableCell>
            <TableCell>{row.password}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.group}</TableCell>
            <TableCell>{row.accountStatus}</TableCell>
            <TableCell>
              <Button onClick={handleClick}>{row.action}</Button>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default User;
