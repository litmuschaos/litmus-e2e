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
    color: theme.palette.text.disabled,
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
  litmusIconFill: {
    "& svg path": {
      fill: theme.palette.text.primary,
    },
  },
  litmusIconStroke: {
    "& svg path": {
      stroke: theme.palette.text.primary,
    },
  },
  rotate: {
    animation: "spin 4s linear infinite",
    color: theme.palette.text.primary,
  },
  noUnderline: {
    textDecoration: "none",
  },
}));

export default useStyles;
