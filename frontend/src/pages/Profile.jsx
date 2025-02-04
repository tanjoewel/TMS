import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import Axios from "axios";
import { useAuth } from "../AuthContext";
import { SNACKBAR_SEVERITIES, useSnackbar } from "../SnackbarContext";

const Profile = () => {
  const { username } = useAuth();
  const { showSnackbar } = useSnackbar();
  // updated fields state
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");

  // readonly fields state
  const [readOnlyUsername, setReadOnlyUsername] = useState(username);
  // i need to pull in the email from somewhere, maybe add in auth context?
  const [readOnlyEmail, setReadOnlyEmail] = useState("Loading...");

  // useEffect to get the profile whenever the profile page loads
  useEffect(() => {
    async function getProfile() {
      const profile = await Axios.get("/profile");
      const email = profile.data.body.email;
      setReadOnlyEmail(email);
    }
    getProfile();
  }, []);

  async function handleSave() {
    const profileObject = { username, updatedEmail, updatedPassword };
    try {
      const result = await Axios.put("/profile", profileObject);
      // if it succeeded, then we clear the fields and update the readonly fields
      setUpdatedEmail("");
      setUpdatedPassword("");
      const snackbarMessage = "Profile successfully updated!";
      showSnackbar(snackbarMessage, SNACKBAR_SEVERITIES[0]);
    } catch (err) {
      showSnackbar(err.response.data.message, SNACKBAR_SEVERITIES[1]);
      console.log("Error updating profile: " + err.response.data.message);
    }
  }

  return (
    <Box sx={{ width: "50%", margin: "auto", textAlign: "left", mt: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        My Profile
      </Typography>

      <Typography>Username</Typography>
      <TextField
        fullWidth
        value={readOnlyUsername}
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
        sx={{ mb: 1 }}
        variant="filled"
      />

      <Typography>Email</Typography>
      <TextField
        fullWidth
        value={readOnlyEmail}
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
        sx={{ mb: 1 }}
        variant="filled"
      />

      <Typography>Update Email</Typography>
      <TextField fullWidth value={updatedEmail} onChange={(e) => setUpdatedEmail(e.target.value)} sx={{ mb: 1 }} />

      <Typography>Update Password</Typography>
      <TextField fullWidth type="password" value={updatedPassword} onChange={(e) => setUpdatedPassword(e.target.value)} sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={handleSave} sx={{ width: "100px" }}>
          SAVE
        </Button>
        <Button variant="contained" sx={{ backgroundColor: "#888", color: "white", width: "100px" }}>
          CANCEL
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
