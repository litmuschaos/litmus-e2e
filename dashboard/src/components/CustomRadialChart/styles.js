import { makeStyles, withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

export const CustomTooltip = withStyles(() => ({
  tooltip: {
    left: "-15px",
  },
}))(Tooltip);

const useStyles = makeStyles(() => ({
  smallRadialChart: {
    height: "3rem",
    margin: "0.5rem 0",
    width: "3rem",
    "& p": {
      fontSize: "1rem",
      maxWidth: "8rem",
      minWidth: "1rem",
      lineHeight: "1rem",
      height: "0.5rem",
    },
  },
  largeRadialChart: {
    height: "7rem",
    margin: "0.5rem 0",
    width: "7rem",
    "& p": {
      fontSize: "2rem",
      maxWidth: "8rem",
      minWidth: "1rem",
      lineHeight: "1rem",
      height: "0.5rem",
    },
  },
}));

export default useStyles;
