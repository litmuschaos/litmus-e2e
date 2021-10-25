import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { Icon } from "litmus-ui";
import useStyles from "./styles";

const CustomisedDropdownItem = ({
  children,
  handleClick,
  label,
  litmusIconName,
  open,
}) => {
  const classes = useStyles();
  return (
    <>
      <ListItem button onClick={handleClick} className={classes.drawerListItem}>
        <ListItemIcon className={classes.listIcon}>
          <Icon name={litmusIconName} />
        </ListItemIcon>
        <ListItemText primary={label} className={classes.listText} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default CustomisedDropdownItem;
