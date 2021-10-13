import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import { Icon } from "litmus-ui";
import history from "utils/history";
import CustomisedListItem from "./CustomisedListItem";
import CustomisedDropdownItem from "./CustomisedDropdownItem";
import { ReactComponent as DocsIcon } from "../../svg/docs.svg";
import useStyles from "./styles";

const SideBar = ({ NightlyData, manualData }) => {
  const [openDropdown, setOpenDropdown] = useState("none");
  const handleDropdown = (value) => {
    setOpenDropdown((prevValue) => {
      if (prevValue === value) {
        return "none";
      }
      return value;
    });
  };
  const classes = useStyles();
  const pathName = useLocation().pathname.split("/")[1];
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
              pathname: "/home",
            });
          }}
          label="Home"
          selected={pathName === "home"}
        >
          <Icon name="home" />
        </CustomisedListItem>
        <div data-cy="nightly-run">
          <CustomisedDropdownItem
            key="nightly-run"
            label="Sheduled Runs"
            litmusIconName="schedule"
            name="nightly-run"
            open={openDropdown === "nightly-run"}
            handleClick={() => handleDropdown("nightly-run")}
          >
            {NightlyData &&
              NightlyData.map((nightlyItem) => (
                <CustomisedListItem
                  key={nightlyItem.id}
                  handleClick={() => {
                    history.push({
                      pathname: `/nightly-runs/${nightlyItem.name}`,
                    });
                  }}
                  label={nightlyItem.readableName}
                  selected={pathName === nightlyItem.name}
                  className={classes.nested}
                >
                  <Icon name="schedule" />
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
            {manualData &&
              manualData.map((manualItem) => (
                <CustomisedListItem
                  key={manualItem.id}
                  handleClick={() => {
                    history.push({
                      pathname: `/manual-runs/${manualItem.name}`,
                    });
                  }}
                  label={manualItem.readableName}
                  selected={pathName === manualItem.name}
                  className={classes.nested}
                >
                  <Icon name="workflow" />
                </CustomisedListItem>
              ))}
          </CustomisedDropdownItem>
        </div>
        <hr className={classes.quickActions} />
        <CustomisedListItem
          key="litmusDocs"
          handleClick={() => {
            window.open("https://docs.litmuschaos.io/");
          }}
          label="Litmus Docs"
        >
          <DocsIcon />
        </CustomisedListItem>
      </List>
    </Drawer>
  );
};

export default SideBar;
