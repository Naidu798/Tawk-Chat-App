import React, { useContext } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { AppContext } from "../context/AppContext";
import { DialogContentText } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const CustomDailog = ({ children, open, setOpen }) => {
  const { isLightMode } = useContext(AppContext);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent
          sx={{
            backgroundColor: isLightMode ? "#F0F4FA" : "#171a21",
            color: "#fff",
          }}
        >
          <DialogContentText
            sx={
              isLightMode
                ? { color: "#000", fontWeight: 600 }
                : { color: "#fff" }
            }
          >
            {children}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default CustomDailog;
