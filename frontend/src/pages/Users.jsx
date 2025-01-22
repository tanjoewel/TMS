import { useState } from "react";
import { NavLink } from "react-router-dom";
import { TextField, Box, Button } from "@mui/material";

export default function Users() {
  const [groupname, setGroupname] = useState("");

  return (
    <div>
      <nav>
        <NavLink to="/">Back to login</NavLink>
      </nav>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", px: 5 }}>
        <h2>Users</h2>
        <div>
          <TextField
            id="groupname"
            label="Group name"
            size="small"
            onChange={(e) => {
              setGroupname(e.target.value);
            }}
          />
          <Button>Create</Button>
        </div>
      </Box>
    </div>
  );
}

("display: flex; justify-content: space-between; align-items: center; width:100% ");
