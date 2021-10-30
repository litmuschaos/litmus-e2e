import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  userName: {
    fontSize: "2.5rem",
  },
  title: {
    fontSize: "2rem",
    margin: "1rem",
  },
  flex: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
}));

export default useStyles;
