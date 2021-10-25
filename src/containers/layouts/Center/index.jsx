import React from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  center: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

const Center = ({ children, className }) => {
  const classes = useStyles();
  return <div className={`${classes.center} ${className}`}>{children}</div>;
};

export default Center;
