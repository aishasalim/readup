// src/components/CustomAlert.jsx
import React, { forwardRef } from "react";
import MuiAlert from "@mui/material/Alert";

const CustomAlert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default CustomAlert;
