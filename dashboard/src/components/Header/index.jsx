import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import StarBorder from "@material-ui/icons/StarBorder";
import AccountTree from "@material-ui/icons/AccountTree";
import { Icon } from "litmus-ui";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";
import SlackLogo from "./images/slack.svg";
import useStyles from "./styles";

const Header = () => {
  const classes = useStyles();
  const [data, setData] = useState({
    version: "",
    stars: "",
    forks: "",
  });
  useEffect(() => {
    sendGetRequest(endpoints.releaseTag()).then((response) => {
      setData((prevData) => ({ ...prevData, version: response?.tag_name }));
    });
    sendGetRequest(endpoints.repoDetails()).then((response) => {
      setData((prevData) => ({
        ...prevData,
        stars: response?.stargazers_count,
        forks: response?.forks_count,
      }));
    });
  }, []);
  return (
    <div data-cy="headerComponent">
      <AppBar className={classes.appBar}>
        <Toolbar disableGutters className={classes.toolBar}>
          <Link
            to={{
              pathname: "/",
            }}
            className={classes.nounderline}
          >
            <Typography className={classes.chaosText} variant="body1">
              <Icon
                name="home"
                size="xl"
                color="white"
                className={classes.homeIcon}
              />{" "}
              E2E Dashboard
            </Typography>
          </Link>

          <div className={classes.middleSection}>
            <Link
              to={{
                pathname: "/nightly-runs",
              }}
              className={classes.nounderline}
            >
              <Typography variant="body1">Nightly Run</Typography>
            </Link>
            <Link
              to={{
                pathname: "/manual-runs",
              }}
              className={classes.nounderline}
            >
              <Typography variant="body1">Manual Run</Typography>
            </Link>
          </div>

          <div className={classes.rightSection}>
            <div className={classes.slackIcon}>
              <a
                href="https://docs.litmuschaos.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="document" size="xl" color="white" />
              </a>
            </div>
            <div className={classes.slackIcon}>
              <a
                href="https://slack.litmuschaos.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={SlackLogo} alt="slack logo" />
              </a>
            </div>
            <div>
              <a
                href="https://github.com/litmuschaos/litmus"
                target="_blank"
                rel="noopener noreferrer"
              >
                litmuschaos/litmus
                <br />
                <LocalOfferIcon style={{ paddingTop: 4 }} />
                {data.version}
                <StarBorder style={{ paddingTop: 4 }} />
                {data.stars}
                <AccountTree style={{ paddingTop: 4 }} />
                {data.forks}
              </a>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
