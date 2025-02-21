import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [updatePage, setUpdatePage] = useState(0);

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
    const a = async () => {
      try {
        setLoading(true);
        await getDistinctGroups();
        await getApps();
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    a();
  }, [updatePage]);

  function handleFieldChange(newValue, index, field) {
    const newApps = apps.map((app, i) => {
      return i === index ? { ...app, [field]: newValue } : app;
    });
    setApps(newApps);
  }

  async function handleUpdateApplicationClick(index) {
    const appToUpdate = apps[index];
    try {
      const axiosResponse = await Axios.patch(`app/update/${appToUpdate.App_Acronym}`, appToUpdate);
      const snackbarMessage = "App has been successfully updated.";
      showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[0]);
      setShowError(false);
    } catch (err) {
      if (err.status === 403) {
        window.location.reload();
      }
      console.log(err);
      setErrorMessage(err.response.data.message);
      setShowError(true);
    }
  }

  function handleAppAcronymClick(acronym) {
    navigate(`/app/${acronym}`);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 5 }}>
        <h2>Applications</h2>
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
                <TableCell sx={{ width: "125px" }}>Acronym</TableCell>
                <TableCell sx={{ width: "125px" }}>R. Num</TableCell>
                <TableCell sx={{ width: "200px" }}>Description</TableCell>
                <TableCell sx={{ width: "125px" }}>Start Date</TableCell>
                <TableCell sx={{ width: "100px" }}>End Date</TableCell>
                <TableCell sx={{ width: "100px" }}>Permit Create</TableCell>
                <TableCell sx={{ width: "100px" }}>Permit Open</TableCell>
                <TableCell sx={{ width: "100px" }}>Permit Todo</TableCell>
                <TableCell sx={{ width: "100px" }}>Permit Doing</TableCell>
                <TableCell sx={{ width: "100px" }}>Permit Done</TableCell>
                <TableCell sx={{ width: "75px" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            {/* Table body */}
            <TableBody>
              {/* Create application row */}
              <CreateApplication groups={groups} setShowError={setShowError} setErrorMessage={setErrorMessage} setUpdatePage={setUpdatePage} />
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
                      <Button onClick={() => handleAppAcronymClick(app.App_Acronym)}>{app.App_Acronym}</Button>
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
                        width: "100%",
                        maxWidth: "none",
                      }}
                    >
                      <TextField
                        fullWidth
                        value={app.App_Description}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        multiline
                        width="100%"
                        onChange={(event) => handleFieldChange(event.target.value, index, "App_Description")}
                      ></TextField>
                    </TableCell>
                    {/* Start date cell */}
                    <TableCell>
                      <DatePicker
                        className="custom-datepicker"
                        selected={app.App_startDate}
                        showIcon
                        onChange={(date) => handleFieldChange(date.toLocaleDateString(), index, "App_startDate")}
                      ></DatePicker>
                    </TableCell>
                    {/* End date cell */}
                    <TableCell>
                      <DatePicker
                        className="custom-datepicker"
                        selected={app.App_endDate}
                        showIcon
                        onChange={(date) => handleFieldChange(date.toLocaleDateString(), index, "App_endDate")}
                      ></DatePicker>
                    </TableCell>
                    {/* Permit create cell */}
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={app.App_permit_Create}
                          onChange={(event) => handleFieldChange(event.target.value, index, "App_permit_Create")}
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
                          onChange={(event) => handleFieldChange(event.target.value, index, "App_permit_Open")}
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
                          value={app.App_permit_toDoList}
                          onChange={(event) => handleFieldChange(event.target.value, index, "App_permit_toDoList")}
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
                          onChange={(event) => handleFieldChange(event.target.value, index, "App_permit_Doing")}
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
                          onChange={(event) => handleFieldChange(event.target.value, index, "App_permit_Done")}
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
                      <Button onClick={() => handleUpdateApplicationClick(index)}>Update</Button>
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
