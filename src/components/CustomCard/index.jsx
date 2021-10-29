import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled";
import GitHub from "@material-ui/icons/GitHub";
import Chip from "@material-ui/core/Chip";
import { Icon } from "litmus-ui";
import { Link } from "react-router-dom";
import { timeDifferenceStrict } from "shared/helper";
import { conclusionMap } from "shared/job";
import { ReactComponent as FailedIcon } from "svg/Failed.svg";
import { ReactComponent as PassedIcon } from "svg/Passed.svg";
import { ReactComponent as PendingIcon } from "svg/Pending.svg";
import { ReactComponent as SkippedIcon } from "svg/Skipped.svg";

const useStyles = makeStyles({
  root: {
    padding: "1rem 2rem",
    margin: "1rem 0",
    flex: "0 0 30%",
  },
  title: {
    fontSize: 14,
    color: "#0000008a",
  },
  flex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeline: {
    margin: "auto 0",
  },
  button: {
    fontSize: "1rem",
  },
  p0: {
    padding: "0",
  },
  img: {
    height: "1.2rem",
  },
  icon: {
    marginBottom: "-0.3rem",
  },
});

const statusBadge = (step) => {
  const classes = useStyles();
  if (step?.status !== "completed") {
    return <PendingIcon className={classes.icon} />;
  }
  if (conclusionMap[step?.conclusion] === "pass") {
    return <PassedIcon className={classes.icon} />;
  }
  if (conclusionMap[step?.conclusion] === "fail") {
    return <FailedIcon className={classes.icon} />;
  }

  return <SkippedIcon className={classes.icon} />;
};

const CustomCard = ({ data, url }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Card className={classes.root} variant="outlined">
      <CardContent className={classes.p0}>
        <Typography className={classes.title} gutterBottom>
          {statusBadge(data?.workflow_runs)} {data?.readableName}
        </Typography>
        <Icon name="scheduleWorkflow" size="lg" color="black" />{" "}
        {`${timeDifferenceStrict(
          data?.workflow_runs?.updated_at,
          new Date()
        )} ago`}
        <br /> <br />
        <Chip label="litmuschaos/litmus-e2e" color="primary" />
      </CardContent>
      <CardActions>
        <PlayCircleFilled />
        <Link
          to={{
            pathname: url || "/workflows",
            state: { id: data?.id, readableName: data?.readableName },
          }}
          style={{ marginLeft: 0 }}
        >
          <Button size="small" className={classes.button}>
            {t("card.pipelineDetails")}
          </Button>
        </Link>
        <a
          href={data?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "black", marginLeft: "auto" }}
        >
          <GitHub />
        </a>
      </CardActions>
    </Card>
  );
};

export default CustomCard;
