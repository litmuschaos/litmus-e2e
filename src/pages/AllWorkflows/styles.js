import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  flexSpace: {
    display: "flex",
    justifyContent: "center",
  },
  flexStart: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  m0: {
    margin: "auto 0",
  },
}));

export default useStyles;
