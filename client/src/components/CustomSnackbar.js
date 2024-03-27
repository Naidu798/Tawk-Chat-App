import React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

function CustomSnackbar({ open, setOpen }) {
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleClick}>Slide Transition</Button>
      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionComponent={SlideTransition()}
        message="I love snacks"
        key={"Slide"}
        autoHideDuration={4000}
      />
    </div>
  );
}

export default CustomSnackbar;
