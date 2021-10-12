import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  IconButton,
  Popover,
  Typography,
  useTheme,
} from '@material-ui/core';
import { ButtonFilled, Icon, TextButton } from 'litmus-ui';
import history from 'utils/history';
import useStyles from './styles';

const ProfileDropdown = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const projectID = "projectID";
  const projectRole = "projectRole";

  // Handle clicks
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'headerProfileDropdown' : undefined;

  const initials = "UN";

  return (
    <div className={classes.profileDropdown} data-cy="headerProfileDropdown">
      <IconButton edge="end" onClick={handleClick}>
        <Avatar className={classes.avatarBackground}>{initials}</Avatar>
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
        <div className={classes.profileDropdownPopover}>
          <Typography>{t('header.profileDropdown.signedIn')}</Typography>
          <div
            className={`${classes.profileDropdownRow} ${classes.profileButtons}`}
          >
            <div data-cy="logoutButton">
              <ButtonFilled
                title="Logout from the portal"
              >
                {t('header.profileDropdown.logout')}
                <Icon
                  id="logoutIcon"
                  name="logout"
                  size="lg"
                  color={theme.palette.background.paper}
                />
              </ButtonFilled>
            </div>

            <TextButton
              title="Edit your profile"
              variant="highlight"
              disabled={projectRole !== 'Owner'}
              onClick={() => {
                history.push({
                  pathname: '/settings',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
            >
              {t('header.profileDropdown.editProfile')}
            </TextButton>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ProfileDropdown;
