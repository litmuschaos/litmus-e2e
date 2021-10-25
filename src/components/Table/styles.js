import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  drawerContainer: {
    minWidth: "22rem",
    marginTop: "3rem",
    textAlign: "left",
  },
  outlinedPills: {
    display: "block",
    margin: "0.5rem",
    width: "min-content",
    borderRadius: "1rem",
    padding: "0.5rem 1rem 1.5rem 1rem",
    fontWeight: "500",
  },
  muted: {
    color: "#6c757d",
  },
  topMargin: {
    marginTop: "1rem",
  },
}));

export default useStyles;
