import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import DatePicker from "react-datepicker";
// default CSS from react-datepicker for the datepicker dropdown itself.
import "react-datepicker/dist/react-datepicker.css";
import { Box, Typography, TextField, Button } from "@mui/material";

const CreatePlan = () => {
  const { acronym } = useParams();
  // const { setErrorMessage, setShowError } = props;
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("lmao");

  const [plan, setPlan] = useState({
    Plan_MVP_name: "",
    Plan_startDate: "",
    Plan_endDate: "",
  });

  function handleFieldChange(newValue, field) {
    setPlan((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  }

  async function handleCreateClick() {
    try {
      const axiosResponse = await Axios.post(`/app/${acronym}/plan/create`, plan);
      setPlan((prev) => ({
        ...prev,
        ["Plan_MVP_name"]: "",
      }));
      setShowError(false);
    } catch (err) {
      setErrorMessage(err.response.data.message);
      setShowError(true);
    }
  }

  return (
    <>
      <Typography sx={{ visibility: showError ? "visible" : "hidden" }} color="red" fontSize="20px">
        {errorMessage}
      </Typography>
      <Box display={"flex"} alignItems="center" gap={1} maxWidth="70%">
        <Typography variant="h5" fontWeight="bold">
          Plan:
        </Typography>
        <TextField
          placeholder="Enter plan name here"
          value={plan.Plan_MVP_name}
          onChange={(event) => handleFieldChange(event.target.value, "Plan_MVP_name")}
          fullWidth
          sx={{ minWidth: "200px" }}
          multiline
        ></TextField>
        <DatePicker
          selected={plan.Plan_startDate}
          customInput={<TextField variant="outlined" size="small" label="Start date" />}
          onChange={(date) => handleFieldChange(date.toLocaleDateString(), "Plan_startDate")}
        />
        <DatePicker
          selected={plan.Plan_endDate}
          customInput={<TextField variant="outlined" size="small" label="End date" />}
          onChange={(date) => handleFieldChange(date.toLocaleDateString(), "Plan_endDate")}
        />
        <Button variant="contained" onClick={handleCreateClick}>
          Create
        </Button>
      </Box>
    </>
  );
};

export default CreatePlan;
