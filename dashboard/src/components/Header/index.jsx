import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import StarBorder from "@material-ui/icons/StarBorder";
import AccountTree from "@material-ui/icons/AccountTree";
import { Icon } from "litmus-ui";
import SlackLogo from "./images/slack.svg";
import useStyles from "./styles";

const Header = () => {
  const classes = useStyles();
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
              />
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
                2.1.1
                <StarBorder style={{ paddingTop: 4 }} />
                2.2k
                <AccountTree style={{ paddingTop: 4 }} />
                416
              </a>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
