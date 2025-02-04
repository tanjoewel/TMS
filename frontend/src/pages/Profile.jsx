import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const Profile = () => {
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");

  const handleSave = () => {
    console.log("Updated Email:", updatedEmail);
    console.log("Updated Password:", updatedPassword);
  };

  return (
    <Box sx={{ width: "50%", margin: "auto", textAlign: "left", mt: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        My Profile
      </Typography>

      <Typography>Username</Typography>
      <TextField
        fullWidth
        value="User1"
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
        value="user1@gmail.com"
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
