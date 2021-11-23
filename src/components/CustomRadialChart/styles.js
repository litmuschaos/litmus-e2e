import { makeStyles, withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

export const CustomTooltip = withStyles(() => ({
  tooltip: {
    left: "-15px",
  },
}))(Tooltip);

const useStyles = makeStyles((theme) => ({
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
    "& rect": {
      fill: theme.palette.background.default,
    },
    "& div:nth-of-type(1)": {
      background: theme.palette.background.default,
    },
  },
  smallRadialChartDrawer: {
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
    "& rect": {
      fill: theme.palette.background.paper,
    },
    "& div:nth-of-type(1)": {
      background: theme.palette.background.paper,
    },
  },
  largeRadialChart: {
    height: "7rem",
    margin: "0.5rem 0",
    width: "7rem",
    "& p:first-of-type": {
      fontSize: "2rem",
      maxWidth: "8rem",
      minWidth: "1rem",
      lineHeight: "1rem",
      height: "0.5rem",
      marginBottom: "1rem",
    },
    "& p": {
      fontSize: "0.7rem",
      maxWidth: "8rem",
      minWidth: "1rem",
      lineHeight: "1rem",
      height: "0.5rem",
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
