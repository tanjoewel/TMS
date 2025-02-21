import React, { useState, useEffect } from "react";
import { TableRow, TableCell, TextField, Button, Select, MenuItem, FormControl } from "@mui/material";
import DatePicker from "react-datepicker";
// default CSS from react-datepicker for the datepicker dropdown itself.
import "react-datepicker/dist/react-datepicker.css";
// CSS for the box itself
import "../styles.css";
import Axios from "axios";

const CreateApplication = (props) => {
  const date = new Date();
  const defaultApp = {
    App_Acronym: "",
    App_Description: "",
    App_Rnumber: "",
    // startDate: "04/20/2025",
    // endDate: "07/08/2027", (it will be of this format)
    App_startDate: date.toLocaleDateString(),
    App_endDate: new Date(date.setMonth(date.getMonth() + 2)).toLocaleDateString(),
    App_permit_Create: "",
    App_permit_Open: "",
    App_permit_toDoList: "",
    App_permit_Doing: "",
    App_permit_Done: "",
  };

  // const setShowError = props.setShowError;
  // const setErrorMessage = props.setErrorMessage;
  const { setShowError, setErrorMessage, setUpdatePage } = props;

  const [application, setApplication] = useState(defaultApp);

  async function handleCreateApplicationClick() {
    // send create app Axios request here
    try {
      // console.log(parseInt(application.App_Rnumber));
      const axiosResponse = await Axios.post("/app/create", application);
      setApplication((prev) => ({
        ...prev,
        ["App_Acronym"]: "",
        ["App_Description"]: "",
        ["App_Rnumber"]: "",
      }));
      setUpdatePage((prev) => {
        return prev + 1;
      });
      setShowError(false);
    } catch (err) {
      setErrorMessage(err.response.data.message);
      setShowError(true);
    }
  }

  function handleTextfieldChange(event, field) {
    setApplication((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  }

  function handleGroupSelect(event, cell) {
    setApplication((prev) => ({
      ...prev,
      [cell]: event.target.value,
    }));
  }

  function handleDatePicker(date, field) {
    setApplication((prev) => ({
      ...prev,
      [field]: date.toLocaleDateString(),
    }));
  }

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
            onChange={(event) => {
              handleTextfieldChange(event, "App_Acronym");
            }}
            value={application.App_Acronym}
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
            onChange={(event) => {
              handleTextfieldChange(event, "App_Rnumber");
            }}
            value={application.App_Rnumber}
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
            onChange={(event) => {
              handleTextfieldChange(event, "App_Description");
            }}
            value={application.App_Description}
          ></TextField>
        </TableCell>
        {/* Start date cell (DATEPICKER)*/}
        <TableCell>
          <DatePicker
            className="custom-datepicker"
            selected={application.App_startDate}
            showIcon
            onChange={(date) => handleDatePicker(date, "App_startDate")}
          ></DatePicker>
        </TableCell>
        {/* End Date cell (DATEPICKER)*/}
        <TableCell>
          <DatePicker
            className="custom-datepicker"
            selected={application.App_endDate}
            showIcon
            onChange={(date) => handleDatePicker(date, "App_endDate")}
          ></DatePicker>
        </TableCell>
        {/* Permit Create cell */}
        <TableCell>
          <FormControl fullWidth>
            <Select
              value={application.App_permit_Create}
              onChange={(event) => handleGroupSelect(event, "App_permit_Create")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {props.groups.map((group) => (
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
              value={application.App_permit_Open}
              onChange={(event) => handleGroupSelect(event, "App_permit_Open")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {props.groups.map((group) => (
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
              value={application.App_permit_toDoList}
              onChange={(event) => handleGroupSelect(event, "App_permit_toDoList")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {props.groups.map((group) => (
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
              value={application.App_permit_Doing}
              onChange={(event) => handleGroupSelect(event, "App_permit_Doing")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {props.groups.map((group) => (
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
              value={application.App_permit_Done}
              onChange={(event) => handleGroupSelect(event, "App_permit_Done")}
              renderValue={(selected) => (selected ? selected : "select")}
              displayEmpty
            >
              {props.groups.map((group) => (
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
