import React from 'react';
import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot 
} from '@material-ui/lab';
import { Icon } from 'litmus-ui';
import { timeDifference } from 'shared/helper';
import useStyles from './styles';

const colours = {
  success: '#09825d',
  fail: '#dd2b0e',
  running: '#3a97d4',
  pending: '#949ab7'
}

const TimelineItemComponent = ({ step, connectorLine=true }) => {
  const classes = useStyles();
  /*
    Possible status values are:
    completed
    in_progress
    pending
    queued
    requeued
    waiting
  */

  if (step.status === "completed") {
    /*
    Possible conclusion values are:
    action_required
    cancelled
    failure
    neutral
    skipped
    stale
    startup_failure
    success
    timed_out
    */  
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
          <TimelineContent>{step.name} <span className={classes.muted}>({timeDifference(step?.started_at, step?.completed_at)})</span></TimelineContent>
        </TimelineItem>      
        );
      case "failure":
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentFailed" color={colours.fail}/>
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>{step.name} <span className={classes.muted}>({timeDifference(step?.started_at, step?.completed_at)})</span></TimelineContent>
          </TimelineItem>      
        );
      case "skipped":
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentSkipped"  color={colours.pending}/>
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>{step.name} <span className={classes.muted}>({timeDifference(step?.started_at, step?.completed_at)})</span></TimelineContent>
          </TimelineItem> 
        )
      default:
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name="experimentError" color={colours.fail} />
              </TimelineDot>
              {connectorLine && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>{step.name} <span className={classes.muted}>({timeDifference(step?.started_at, step?.completed_at)})</span></TimelineContent>
          </TimelineItem> 
        )
    }
  }  
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot>
          <Icon name="experimentPending"  color={colours.running}/>
        </TimelineDot>
        {connectorLine && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>{step.name} <span className={classes.muted}>({timeDifference(step?.started_at, step?.completed_at)})</span></TimelineContent>
    </TimelineItem>
  )
};

const TimelineComponent = ({ job }) => {
  return (
    <Timeline>
      {job.steps && job.steps.map((step, index) => {
        if(index === job.steps.length - 1) {
          return <TimelineItemComponent step={step} connectorLine={false}/>
        }
        return <TimelineItemComponent step={step} />
      })}
  </Timeline>
  )
}

export default TimelineComponent;