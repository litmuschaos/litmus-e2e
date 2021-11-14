import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: "100%",
    height: "100%",
  },
  drawerPaper: {
    width: "100%",
    background: theme.palette.sidebarMenu,
    position: "relative",
  },

  drawerListItem: {
    height: "auto",
    transition: "0.8s",
    "&:hover": {
      backgroundColor: theme.palette.disabledBackground,
    },
  },
  active: {
    backgroundColor: `${theme.palette.cards.highlight} !important`,
    color: theme.palette.highlight,
  },
  listIcon: {
    paddingLeft: theme.spacing(2),
  },
  listText: {
    "& span": {
      fontWeight: 500,
      fontSize: "0.8rem",
    },
  },
  drawerList: {
    marginTop: theme.spacing(8.375),
  },
  quickActions: {
    width: "80%",
    border: `1px solid ${theme.palette.border.main}`,
  },
  versionlogo: {
    width: "1.25rem",
    height: "2.185rem",
  },
  versionText: {
    margin: "auto",
    marginLeft: theme.spacing(1.25),
    fontSize: "0.75rem",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default useStyles;
