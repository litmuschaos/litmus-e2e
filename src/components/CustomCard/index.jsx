import React from "react";
import { useTranslation } from "react-i18next";
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
import { ReactComponent as FailedIcon } from "svg/failed.svg";
import { ReactComponent as PassedIcon } from "svg/success.svg";
import { ReactComponent as PendingIcon } from "svg/inProgress.svg";
import { ReactComponent as SkippedIcon } from "svg/skipped.svg";
import useStyles from "./styles";

const statusBadge = (step) => {
  if (step?.status !== "completed") {
    return <PendingIcon />;
  }
  if (conclusionMap[step?.conclusion] === "pass") {
    return <PassedIcon />;
  }
  if (conclusionMap[step?.conclusion] === "fail") {
    return <FailedIcon />;
  }

  return <SkippedIcon />;
};

const CustomCard = ({ data, url, displayBadge }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Card className={classes.root} variant="outlined">
      <CardContent className={classes.p0}>
        <Typography className={classes.title} gutterBottom>
          {data?.readableName}
        </Typography>
        <Icon
          name="scheduleWorkflow"
          size="lg"
          className={classes.litmusIcon}
        />{" "}
        {`${timeDifferenceStrict(
          data?.workflow_runs?.updated_at,
          new Date()
        )} ago`}
        <br /> <br />
        <div className={classes.flex}>
          <Chip
            label={t("card.litmus-e2e")}
            color="primary"
            className={classes.chip}
          />
          {displayBadge ? statusBadge(data?.workflow_runs) : null}
        </div>
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
