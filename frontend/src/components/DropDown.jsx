import React, { useState } from "react";
import { Menu, MenuItem, ListItemText, Checkbox, Button } from "@mui/material";

// helper component for the drop down used in the enabled status and groups.
const DropDown = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const items = props.items;
  const multiSelect = props.multiSelect;
  const buttonText = props.buttonText;

  function handleClick(e) {
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleToggle() {
    console.log("Toggle!");
  }

  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        endIcon={open ? <img src="public/DropArrowUp.svg" /> : <img src="public/DropDownArrow.svg" />}
      >
        {buttonText}
      </Button>
      <Menu id="basic-button" open={open} anchorEl={anchorEl} onClose={handleClose}>
        {items.map((item) => {
          return (
            <MenuItem key={item} onClick={handleClose}>
              {item}
              {multiSelect ? <Checkbox /> : <></>}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default DropDown;
