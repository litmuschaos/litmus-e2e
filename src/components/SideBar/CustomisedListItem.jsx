import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import useStyles from "./styles";

const CustomisedListItem = ({
  children,
  handleClick,
  label,
  selected,
  className,
}) => {
  const classes = useStyles();
  return (
    <ListItem
      button
      selected={selected}
      onClick={handleClick}
      className={`${classes.drawerListItem} ${
        selected ? classes.active : ""
      } ${className}`}
    >
      <ListItemIcon className={classes.listIcon}>{children}</ListItemIcon>
      <ListItemText primary={label} className={classes.listText} />
    </ListItem>
  );
};

export default CustomisedListItem;
