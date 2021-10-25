import React from "react";
import { CircularProgress, makeStyles, Typography } from "@material-ui/core";
import Center from "../../containers/layouts/Center";

const useStyles = makeStyles((theme) => ({
  spinner: {
    color: theme.palette.primary.main,
  },
}));

const Loader = ({ size, message }) => {
  const classes = useStyles();
  const defaultSize = 40;
  return (
    <div>
      <Center>
        <CircularProgress
          className={classes.spinner}
          size={size || defaultSize}
        />
      </Center>
      <Typography>{message}</Typography>
    </div>
  );
};

export default Loader;
