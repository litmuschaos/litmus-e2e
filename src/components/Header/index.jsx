import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Icon } from "litmus-ui";
import SlackLogo from "./images/slack.svg";
import GitHubLogo from "./images/github.svg";
import useStyles from "./styles";

const Header = () => {
  const classes = useStyles();
  const { t } = useTranslation();
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
              {t("header.e2eDashboard")}
            </Typography>
          </Link>

          <div className={classes.middleSection}>
            <Link
              to={{
                pathname: "/",
                state: {
                  pipelinesToDisplay: {
                    manual: true,
                    nightly: true,
                  },
                },
              }}
              className={classes.nounderline}
            >
              <Typography variant="body1">
                <Icon name="home" size="lg" color="white" />
                &nbsp;{t("header.home")}
              </Typography>
            </Link>
            <Link
              to={{
                pathname: "/",
                state: {
                  pipelinesToDisplay: {
                    manual: false,
                    nightly: true,
                  },
                },
              }}
              className={classes.nounderline}
            >
              <Typography variant="body1">
                <Icon name="scheduleWorkflow" size="lg" color="white" />
                &nbsp;{t("header.nightlyRuns")}
              </Typography>
            </Link>
            <Link
              to={{
                pathname: "/",
                state: {
                  pipelinesToDisplay: {
                    manual: true,
                    nightly: false,
                  },
                },
              }}
              className={classes.nounderline}
            >
              <Typography variant="body1">
                <Icon name="workflow" size="lg" color="white" />
                &nbsp;{t("header.manualRuns")}
              </Typography>
            </Link>
          </div>

          <div className={classes.rightSection}>
            <div className={classes.slackIcon}>
              <a
                href="https://slack.litmuschaos.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={GitHubLogo} alt="GitHub logo" />
              </a>
            </div>
            <div className={classes.slackIcon}>
              <a
                href="https://slack.litmuschaos.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={SlackLogo} alt="Slack logo" />
              </a>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
