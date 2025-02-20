import React, { useState, useEffect } from "react";
import { TableRow, TableCell, TextField, Button, Select, MenuItem, FormControl } from "@mui/material";
import DatePicker from "react-datepicker";
// default CSS from react-datepicker for the datepicker dropdown itself.
import "react-datepicker/dist/react-datepicker.css";
// CSS for the box itself
import "../styles.css";

const CreateApplication = () => {
  const [application, setApplication] = useState({
    acronym: null,
    runningNumber: null,
    description: null,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2027-02-02"),
    permitCreate: "",
    permitOpen: "",
    permitTodo: "",
    permitDoing: "",
    permitDone: "",
  });

  const groups = ["admin", "PL", "PM", "dev", "test1"];

  function handleCreateApplicationClick() {
    alert("create app clicked");
  }

  function handleGroupSelect(event, cell) {
    setApplication((prev) => ({
      ...prev,
      [cell]: event.target.value,
    }));
  }

  function handleDatePicker(date, field) {
    console.log("HANDLED DATE PICKER: ", date, field);
    alert("Date picker clicked");
  }

  // need to load unique group names, then all the permit cells will use it. for now this is a dummy list of groups
  useEffect(() => {
    console.log("Load group names here");
  }, []);

  return (
    <>
      <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" }, "& > td": { backgroundColor: "#e0e0e0" } }}>
        {/* Acronym cell */}
        <TableCell
          style={{
            verticalAlign: "top",
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: "150px",
          }}
        >
          <TextField
            placeholder="Enter acronym"
            fullWidth={true}
            name="acronym"
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            multiline
          ></TextField>
        </TableCell>
        {/* Running number cell */}
        <TableCell
          style={{
            verticalAlign: "top",
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: "125px",
          }}
        >
          <TextField
            placeholder="Enter R. Num"
            fullWidth={true}
            name="R. Num"
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            multiline
          ></TextField>
        </TableCell>
        {/* Description cell */}
        <TableCell
          style={{
            verticalAlign: "top",
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: "250px",
          }}
        >
          <TextField
            placeholder="Enter description"
            fullWidth={true}
            name="Description"
            sx={{
              "& .MuiInputLabel-root": {
                fontSize: "12px",
              },
            }}
            variant="standard"
            InputProps={{ disableUnderline: true }}
            multiline
          ></TextField>
        </TableCell>
        {/* Start date cell (DATEPICKER)*/}
        <TableCell>
          <DatePicker
            className="custom-datepicker"
            selected={application.startDate}
            showIcon
            onChange={(date) => handleDatePicker(date, "startDate")}
          ></DatePicker>
        </TableCell>
        {/* End Date cell (DATEPICKER)*/}
        <TableCell>
          <DatePicker className="custom-datepicker" selected={application.endDate} showIcon onChange={(date) => handleDatePicker(date, "endDate")}></DatePicker>
        </TableCell>
        {/* Permit Create cell */}
        <TableCell>
          <FormControl fullWidth>
            <Select
              value={application.permitCreate}
              onChange={(event) => handleGroupSelect(event, "permitCreate")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        {/* Permit Open cell */}
        <TableCell>
          <FormControl fullWidth>
            <Select
              value={application.permitOpen}
              onChange={(event) => handleGroupSelect(event, "permitOpen")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        {/* Permit todo cell */}
        <TableCell>
          <FormControl fullWidth>
            <Select
              value={application.permitTodo}
              onChange={(event) => handleGroupSelect(event, "permitTodo")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        {/* Permit doing cell */}
        <TableCell>
          <FormControl fullWidth>
            <Select
              value={application.permitDoing}
              onChange={(event) => handleGroupSelect(event, "permitDoing")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        {/* Permit Done cell */}
        <TableCell>
          <FormControl fullWidth>
            <Select
              value={application.permitDone}
              onChange={(event) => handleGroupSelect(event, "permitDone")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        {/* Action cell */}
        <TableCell>
          <Button onClick={handleCreateApplicationClick}>Create</Button>
        </TableCell>
      </TableRow>
    </>
  );
};

export default CreateApplication;
