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
import CreateUser from "../components/CreateUser";
import Axios from "axios";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";

const Applications = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("lmao");
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
          <Table sx={{ minWidth: 650, border: "1px solid black" }} aria-label="simple table" size="small">
            {/* Table header */}
            <TableHead>
              <TableRow sx={{ "& > th:not(:last-child)": { borderRight: "1px solid black" }, borderBottom: "2px solid black" }}>
                <TableCell label={"username"}>Acronym</TableCell>
                <TableCell>R. Num</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Permit Create</TableCell>
                <TableCell>Permit Open</TableCell>
                <TableCell>Permit Todo</TableCell>
                <TableCell>Permit Doing</TableCell>
                <TableCell>Permit Done</TableCell>
                <TableCell>Permit Action</TableCell>
              </TableRow>
            </TableHead>
            {/* Table body */}
            <TableBody></TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Applications;
