import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    maxWidth: "8rem",
  },
  label: {
    color: "#0000008a",
  },
  flexSpace: {
    display: "flex",
    justifyContent: "space-between",
  },
  flexStart: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  m0: {
    margin: "auto 0",
  },
  small: {
    fontSize: "0.8rem",
  },
}));

export default useStyles;
