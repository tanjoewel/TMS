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
  MenuItem,
  Typography,
  Switch,
  FormControl,
  Select,
} from "@mui/material";
import CreateApplication from "../components/CreateApplication";
import Axios from "axios";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";
import DatePicker from "react-datepicker";
// default CSS from react-datepicker for the datepicker dropdown itself.
import "react-datepicker/dist/react-datepicker.css";
// CSS for the box itself
import "../styles.css";

const Applications = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("lmao");
  const [apps, setApps] = useState([]);
  const [groups, setGroups] = useState([]);

  const { showSnackbar } = useSnackbar();

  async function getApps() {
    try {
      const apps = await Axios.get("/app/all");
      setApps(apps.data);
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

  // when the page first loads, get the applications and unique groups from the database
  useEffect(() => {
    getApps();
    getDistinctGroups();
  }, []);

  function handleDatePicker(date, field) {
    console.log("HANDLED DATE PICKER: ", date, field);
    alert("Date picker clicked");
  }

  function handlePermitSelect(index, event, field) {
    alert("permit select clicked");
  }

  function handleUpdateApplicationClick() {
    alert("update application clicked");
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 5 }}>
        <h2>Applications</h2>
        {/* <div>
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
        </div> */}
      </Box>
      <Typography sx={{ visibility: showError ? "visible" : "hidden" }} color="red" paddingLeft="26px" fontSize="20px">
        {errorMessage}
      </Typography>
      <Box sx={{ mx: 3, mt: 2 }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650, border: "1px solid black", tableLayout: "fixed" }} aria-label="simple table" size="small">
            {/* Table header */}
            <TableHead>
              <TableRow sx={{ "& > th:not(:last-child)": { borderRight: "1px solid black" }, borderBottom: "2px solid black" }}>
                <TableCell label={"username"}>Acronym</TableCell>
                <TableCell sx={{ width: "125px" }}>R. Num</TableCell>
                <TableCell sx={{ width: "350px" }}>Description</TableCell>
                <TableCell sx={{ width: "125px" }}>Start Date</TableCell>
                <TableCell sx={{ width: "125px" }}>End Date</TableCell>
                <TableCell>Permit Create</TableCell>
                <TableCell>Permit Open</TableCell>
                <TableCell>Permit Todo</TableCell>
                <TableCell>Permit Doing</TableCell>
                <TableCell>Permit Done</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {/* Table body */}
            <TableBody>
              {/* Create application row */}
              <CreateApplication />
              {/* Applcations */}
              {apps.map((app, index) => {
                return (
                  <TableRow sx={{ "& > td:not(:last-child)": { borderRight: "1px solid black", p: "1px" } }} key={app.App_Acronym}>
                    {/* Acronym cell */}
                    <TableCell
                      style={{
                        verticalAlign: "top",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      <Button>{app.App_Acronym}</Button>
                    </TableCell>
                    {/* Running number cell (typography as it is read only)*/}
                    <TableCell
                      style={{
                        verticalAlign: "top",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography padding="10px">{app.App_Rnumber}</Typography>
                    </TableCell>
                    {/* App description cell */}
                    <TableCell
                      sx={{
                        verticalAlign: "top",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      <TextField value={app.App_Description} variant="standard" InputProps={{ disableUnderline: true }} multiline></TextField>
                    </TableCell>
                    {/* Start date cell */}
                    <TableCell>
                      <DatePicker className="custom-datepicker" showIcon onChange={(date) => handleDatePicker(date, "App.startDate")}></DatePicker>
                    </TableCell>
                    {/* End date cell */}
                    <TableCell>
                      <DatePicker className="custom-datepicker" showIcon onChange={(date) => handleDatePicker(date, "App.endDate")}></DatePicker>
                    </TableCell>
                    {/* Permit create cell */}
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={app.App_permit_Create}
                          onChange={(event) => handlePermitSelect(index, event, "App_permit_Create")}
                          renderValue={(selected) => (selected ? selected : "select")}
                          displayEmpty
                          fullWidth
                        >
                          {groups.map((group) => (
                            <MenuItem key={group} value={group}>
                              {group}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    {/* Permit open cell */}
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={app.App_permit_Open}
                          onChange={(event) => handlePermitSelect(index, event, "App_permit_Open")}
                          renderValue={(selected) => (selected ? selected : "select")}
                          displayEmpty
                          fullWidth
                        >
                          {groups.map((group) => (
                            <MenuItem key={group} value={group}>
                              {group}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    {/* Permit to do cell */}
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={app.App_permit_todoList}
                          onChange={(event) => handlePermitSelect(index, event, "App_permit_toDoList")}
                          renderValue={(selected) => (selected ? selected : "select")}
                          displayEmpty
                          fullWidth
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
                          value={app.App_permit_Doing}
                          onChange={(event) => handlePermitSelect(index, event, "App_permit_Doing")}
                          renderValue={(selected) => (selected ? selected : "select")}
                          displayEmpty
                          fullWidth
                        >
                          {groups.map((group) => (
                            <MenuItem key={group} value={group}>
                              {group}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    {/* Permit done cell */}
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={app.App_permit_Done}
                          onChange={(event) => handlePermitSelect(index, event, "App_permit_Done")}
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
                      <Button onClick={handleUpdateApplicationClick}>Update</Button>
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
};

export default Applications;
