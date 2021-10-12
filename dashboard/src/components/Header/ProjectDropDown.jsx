import React, { useState } from 'react';
import { IconButton, Popover, Typography } from '@material-ui/core';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import useStyles from './styles';

const ProjectDropdown = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  // Handle clicks
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'headerProjectDropdown' : undefined;

  return (
    <div className={classes.projectDropdown} data-cy="headerProjectDropdown">
      <Typography>Setting</Typography>
      <IconButton edge="end" onClick={handleClick}>
        <ExpandMoreRoundedIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {/* <ProjectDropdownItems /> */}
      </Popover>
    </div>
  );
};

export default ProjectDropdown;
