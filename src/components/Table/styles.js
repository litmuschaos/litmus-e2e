import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
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
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "max-content",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tab: {
    "& span.MuiTab-wrapper": {
      alignItems: "flex-start",
    },
  },
}));

export default useStyles;
