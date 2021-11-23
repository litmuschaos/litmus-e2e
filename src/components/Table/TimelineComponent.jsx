import React from "react";
import Timeline from "@material-ui/lab/Timeline";
import TimelineItem from "@material-ui/lab/TimelineItem";
import TimelineSeparator from "@material-ui/lab/TimelineSeparator";
import TimelineConnector from "@material-ui/lab/TimelineConnector";
import TimelineContent from "@material-ui/lab/TimelineContent";
import TimelineDot from "@material-ui/lab/TimelineDot";
import LoopIcon from "@material-ui/icons/Loop";
import { Icon } from "litmus-ui";
import CustomAccordion from "components/CustomAccordion";
import { timeDifference } from "shared/helper";
import useStyles from "./styles";

const colours = {
  success: "#09825d",
  fail: "#dd2b0e",
  running: "#3a97d4",
  pending: "#949ab7",
};

const IconMap = ({ step }) => {
  const classes = useStyles();
  if (step.status === "completed") {
    switch (step.conclusion) {
      case "success":
        return <Icon name="experimentPassed" color={colours.success} />;
      case "failure":
        return <Icon name="experimentFailed" color={colours.fail} />;
      case "skipped":
        return <Icon name="experimentSkipped" color={colours.pending} />;
      default:
        return <Icon name="experimentError" color={colours.fail} />;
    }
  }
  return <LoopIcon className={classes.rotate} />;
};

const TimelineItemComponent = ({
  step,
  pipelineId,
  jobName,
  connectorLine = true,
}) => {
  const classes = useStyles();
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot>
          <IconMap step={step} />
        </TimelineDot>
        {connectorLine && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <CustomAccordion
          pipelineId={pipelineId}
          jobName={jobName}
          stepNumber={step?.number}
        >
          <div>
            {step.name}{" "}
            <span className={classes.muted}>
              ({timeDifference(step?.started_at, step?.completed_at)})
            </span>
          </div>
        </CustomAccordion>
      </TimelineContent>
    </TimelineItem>
  );
};

const TimelineComponent = ({ job, pipelineId, jobName }) => (
  <Timeline>
    {job.steps &&
      job.steps.map((step, index) => {
        if (index === job.steps.length - 1) {
          return (
            <TimelineItemComponent
              step={step}
              connectorLine={false}
              pipelineId={pipelineId}
              jobName={jobName}
            />
          );
        }
        return (
          <TimelineItemComponent
            step={step}
            pipelineId={pipelineId}
            jobName={jobName}
          />
        );
      })}
  </Timeline>
);

export default TimelineComponent;
