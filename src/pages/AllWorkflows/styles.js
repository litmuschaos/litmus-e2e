import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
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
  subheading: {
    color: theme.palette.text.hint,
  },
}));

export default useStyles;
