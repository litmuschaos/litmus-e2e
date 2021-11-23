import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  button: {
    background: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    textAlign: "left",
    fontWeight: 700,
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem",
    cursor: "pointer",
    border: "none",
    borderRadius: "2rem",
  },
  control: {
    fontSize: "20px",
  },
  pre: {
    width: "40rem",
    overflowX: "scroll",
  },
}));

export default useStyles;
