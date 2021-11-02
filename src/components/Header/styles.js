import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "sticky",
    boxShadow:
      "0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 0px 3.2px 7.2px rgba(0, 0, 0, 0.13)",
  },
  toolBar: {
    height: "4.9rem",
    display: "flex",
    justifyContent: "space-between",
    background: theme?.palette?.header,
    padding: theme.spacing(0, 7.5),
    "& *": {
      color: "white",
    },
    "& nav": {
      flexGrow: 1,
      marginLeft: theme.spacing(15),
    },
  },
  nounderline: {
    textDecoration: "none",
  },
  chaosText: {
    fontSize: "1.625rem",
    fontWeight: 600,
  },
  rightSection: {
    display: "flex",
    justifyContent: "space-between",
    "& div": {
      marginRight: "0.5rem",
    },
    "& a": {
      textDecoration: "none",
    },
  },
  slackIcon: {
    height: "max-content",
    paddingTop: "0.4rem",
  },
  middleSection: {
    display: "flex",
    justifyContent: "center",
    flexGrow: 1,
    "& a": {
      margin: "0 1.5rem",
    },
  },
}));

export default useStyles;
