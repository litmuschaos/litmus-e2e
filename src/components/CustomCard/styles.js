import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    padding: "1rem 2rem",
    margin: "1rem 0",
    flex: "0 0 30%",
  },
  title: {
    fontSize: "1rem",
    fontWeight: "500",
  },
  flex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeline: {
    margin: "auto 0",
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
  icon: {
    marginBottom: "-0.3rem",
  },
  chip: {
    fontSize: "0.8rem",
  },
});

export default useStyles;
