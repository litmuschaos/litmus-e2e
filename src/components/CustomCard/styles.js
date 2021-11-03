import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem 2rem",
    margin: "1rem 0",
    flex: "0 0 30%",
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  title: {
    fontSize: "1rem",
    fontWeight: "500",
  },
  button: {
    fontSize: "1rem",
    textTransform: "none",
  },
  p0: {
    padding: "0",
  },
  img: {
    height: "1.2rem",
  },
  flex: {
    display: "flex",
    justifyContent: "space-between",
  },
  chip: {
    fontSize: "0.8rem",
  },
  litmusIcon: {
    "& svg path": {
      stroke: theme.palette.text.primary,
    },
  },
}));

export default useStyles;
