import React from "react";
import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import { Icon } from "litmus-ui";
import { timeDifference } from "shared/helper";
import useStyles from "./styles";

const colours = {
  success: "#09825d",
  fail: "#dd2b0e",
  running: "#3a97d4",
  pending: "#949ab7",
};

const TimelineItemComponent = ({ step, connectorLine = true }) => {
  const classes = useStyles();
  if (step.status === "completed") {
    switch (step.conclusion) {
      case "success":
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentPassed" color={colours.success} />
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {step.name}{" "}
              <span className={classes.muted}>
                ({timeDifference(step?.started_at, step?.completed_at)})
              </span>
            </TimelineContent>
          </TimelineItem>
        );
      case "failure":
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentFailed" color={colours.fail} />
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {step.name}{" "}
              <span className={classes.muted}>
                ({timeDifference(step?.started_at, step?.completed_at)})
              </span>
            </TimelineContent>
          </TimelineItem>
        );
      case "skipped":
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentSkipped" color={colours.pending} />
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {step.name}{" "}
              <span className={classes.muted}>
                ({timeDifference(step?.started_at, step?.completed_at)})
              </span>
            </TimelineContent>
          </TimelineItem>
        );
      default:
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentError" color={colours.fail} />
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {step.name}{" "}
              <span className={classes.muted}>
                ({timeDifference(step?.started_at, step?.completed_at)})
              </span>
            </TimelineContent>
          </TimelineItem>
        );
    }
  }
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot>
          <Icon name="experimentPending" color={colours.running} />
        </TimelineDot>
        {connectorLine && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        {step.name}{" "}
        <span className={classes.muted}>
          ({timeDifference(step?.started_at, step?.completed_at)})
        </span>
      </TimelineContent>
    </TimelineItem>
  );
};

const TimelineComponent = ({ job }) => (
  <Timeline>
    {job.steps &&
      job.steps.map((step, index) => {
        if (index === job.steps.length - 1) {
          return <TimelineItemComponent step={step} connectorLine={false} />;
        }
        return <TimelineItemComponent step={step} />;
      })}
  </Timeline>
);

export default TimelineComponent;
