import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useTheme } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { Icon } from "litmus-ui";
import ColorModeContext from "shared/ColorModeContext";
import SlackLogo from "./images/slack.svg";
import GitHubLogo from "./images/github.svg";
import useStyles from "./styles";

const Header = () => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
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
                <Icon
                  name="home"
                  size="lg"
                  color={theme.palette.text.tertiary}
                />
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
                <Icon
                  name="scheduleWorkflow"
                  size="lg"
                  color={theme.palette.text.tertiary}
                />
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
                <Icon
                  name="workflow"
                  size="lg"
                  color={theme.palette.text.tertiary}
                />
                &nbsp;{t("header.manualRuns")}
              </Typography>
            </Link>
          </div>

          <div className={classes.rightSection}>
            <div className={classes.slackIcon}>
              {theme.palette.mode === "dark" ? (
                <Brightness4Icon onClick={colorMode.toggleColorMode} />
              ) : (
                <Brightness7Icon onClick={colorMode.toggleColorMode} />
              )}
            </div>
            <div className={classes.slackIcon}>
              <a
                href="https://github.com/litmuschaos/litmus-e2e"
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
