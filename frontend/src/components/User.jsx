import React from "react";
import { TextField, Box, Button, TableBody, TableHead, Table, TableContainer, TableRow, Paper, TableCell } from "@mui/material";

// this component represents one user and its fields, then in the users page we can just loop through the users array we get from the backend and return this component in each loop.
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
              <Button>{row.action}</Button>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default User;
