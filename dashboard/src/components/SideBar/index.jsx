import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import { Icon } from 'litmus-ui';
import history from 'utils/history';
import CustomisedListItem from "./CustomisedListItem";
import CustomisedDropdownItem from "./CustomisedDropdownItem";
import { ReactComponent as CodeIcon } from '../../svg/code.svg';
import { ReactComponent as CommunityIcon } from '../../svg/community.svg';
import { ReactComponent as DocsIcon } from '../../svg/docs.svg';
import useStyles from './styles';

const SideBar= ({ scheduledData, manualData }) => {
  // const [openScheduled, setOpenScheduled] = useState(true);
  // const [openManual, setOpenManual] = useState(true);
  const [openDropdown, setOpenDropdown] = useState("none");
  const handleDropdown = (value) => {
    console.log("value is", value);
    setOpenDropdown((prevValue) => {
      if(prevValue === value) {
        return "none";
      }
      return value;
    });
  }
  // const handleScheduled = () => {
  //   setOpenScheduled((prevState) => !prevState);
  // }
  // const handleManual = () => {
  //   setOpenManual((prevState) => !prevState);
  // }
  const classes = useStyles();
  const pathName = useLocation().pathname.split('/')[1];
  return (
    <Drawer
      data-cy="sidebarComponent"
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <List className={classes.drawerList}>
        <CustomisedListItem
          key="home"
          handleClick={() => {
            history.push({
              pathname: '/home'
            });
          }}
          label="Home"
          selected={pathName === 'home'}
        >
          <Icon name="home" />
        </CustomisedListItem>
        <div data-cy="scheduled-run">
          <CustomisedDropdownItem
            key="scheduled-run"            
            label="Sheduled Runs"
            litmusIconName="schedule"
            name="scheduled-run"
            open={openDropdown === "scheduled-run"}
            handleClick={() => handleDropdown("scheduled-run")}
          >
            {scheduledData && scheduledData.map((scheduledItem) => (
              <CustomisedListItem
                key={scheduledItem.id}
                handleClick={() => {
                  history.push({
                    pathname: `/scheduled-runs/${scheduledItem.name}`
                  });
                }}
                label={scheduledItem.readableName}
                selected={pathName === scheduledItem.name}
                className={classes.nested}
              >
                <Icon name="schedule"/>
              </CustomisedListItem>
            ))}
          </CustomisedDropdownItem>
        </div>
        <div data-cy="manual-run">
          <CustomisedDropdownItem
            key="manual-run"            
            label="Manual Runs"
            litmusIconName="userEnable"
            name="manual-run"
            open={openDropdown === "manual-run"}
            handleClick={() => handleDropdown("manual-run")}
          >
            {manualData && manualData.map((manualItem) => (
              <CustomisedListItem
                key={manualItem.id}
                handleClick={() => {
                  history.push({
                    pathname: `/manual-runs/${manualItem.name}`
                  });
                }}
                label={manualItem.readableName}
                selected={pathName === manualItem.name}
                className={classes.nested}
              >
                <Icon name="workflow"/>
              </CustomisedListItem>
            ))}
          </CustomisedDropdownItem>
        </div>
        <hr className={classes.quickActions} />
        <CustomisedListItem
          key="litmusDocs"
          handleClick={() => {
            window.open('https://docs.litmuschaos.io/');
          }}
          label="Litmus Docs"
        >
          <DocsIcon />
        </CustomisedListItem>
        {/* <CustomisedListItem
          key="litmusAPIDocs"
          handleClick={() => {
            window.open(
              'https://litmuschaos.github.io/litmus/graphql/v2.0.0/api.html'
            );
          }}
          label="Litmus API Docs"
        >
          <CodeIcon />
        </CustomisedListItem> */}
        {/* <CustomisedListItem
          key="Slack"
          handleClick={() => {
            window.open(
              'https://app.slack.com/client/T09NY5SBT/CNXNB0ZTN'
            );
          }}
          label="Slack"
        >
          <CommunityIcon />
        </CustomisedListItem> */}
      </List>
    </Drawer>
  );
};

export default SideBar;
