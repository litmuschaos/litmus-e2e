import { makeStyles, withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

export const CustomTooltip = withStyles(() => ({
  tooltip: {
    left: "-15px",
  },
}))(Tooltip);

const useStyles = makeStyles((theme) => ({
  largeRadialChart: {
    height: "7rem",
    margin: "0.5rem 0",
    width: "7rem",
    "& img": {
      display: "none",
    },
    "& div": {
      fontSize: "1rem",
      width: "fit-content",
      margin: "auto",
      fontWeight: 600,
      height: "auto",
    },
    "& rect": {
      fill: theme.palette.background.default,
    },
    "& div:nth-of-type(1)": {
      background: theme.palette.background.default,
    },
  },
}));

export default useStyles;
