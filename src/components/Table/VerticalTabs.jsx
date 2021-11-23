import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GitHubIcon from "@material-ui/icons/GitHub";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { CircularProgress } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { OutlinedPills, Icon } from "litmus-ui";
import CustomRadialChart from "components/CustomRadialChart";
import { getTotalPipelineTime } from "shared/helper";
import { jobStepResult } from "shared/job";
import TimelineComponent from "./TimelineComponent";
import useStyles from "./styles";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

const conclusionMap = {
  action_required: "pending",
  cancelled: "failed",
  failure: "failed",
  neutral: "succeeded",
  skipped: "pending",
  stale: "succeeded",
  startup_failure: "failed",
  success: "succeeded",
  timed_out: "failed",
};

const a11yProps = (index) => ({
  id: `vertical-tab-${index}`,
  "aria-controls": `vertical-tabpanel-${index}`,
});

export default function VerticalTabs({ data, pipelineId }) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [result, setResult] = useState(
    jobStepResult(data.jobs[0].steps) || {
      pending: 0,
      pass: 0,
      fail: 0,
    }
  );
  const handleChange = (_event, newValue) => {
    setValue(newValue);
    setResult(jobStepResult(data.jobs[newValue].steps));
  };
  const { t } = useTranslation();
  return (
    <>
      <hr />
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={7}>
          <p>
            {t("table.pipelineId")}:{" "}
            <a
              href={`https://github.com/litmuschaos/litmus-e2e/actions/runs/${pipelineId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.noUnderline}
            >
              {pipelineId}
              <Icon name="externalLink" className={classes.litmusIconStroke} />
            </a>
            <br />
            <Icon
              name="clock"
              size="sm"
              className={classes.litmusIconFill}
            />{" "}
            {getTotalPipelineTime(data?.jobs)} <br />
          </p>
        </Grid>
        <Grid item xs={5}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {result && (
              <>
                <CustomRadialChart
                  pass={result.pass}
                  fail={result.fail}
                  pending={result.pending}
                  drawer
                />
                <a
                  href={data.jobs[value]?.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "black",
                    height: "auto",
                    marginTop: "auto",
                    marginBottom: "auto",
                  }}
                >
                  <GitHubIcon style={{ height: "auto", fontSize: "2.1rem" }} />
                </a>
                {result.pending ? (
                  <CircularProgress
                    style={{ maxWidth: "30", maxHeight: "30", margin: "1rem" }}
                  />
                ) : null}
              </>
            )}
          </div>
        </Grid>
      </Grid>
      <hr />
      <div className={classes.root}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          className={classes.tabs}
        >
          {data &&
            data.jobs &&
            data.jobs.map((job, index) => (
              <Tab
                label={
                  <OutlinedPills
                    color="primary"
                    label={job.name}
                    size="medium"
                    variant={conclusionMap[job.conclusion]}
                    className={classes.outlinedPills}
                  />
                }
                {...a11yProps(index)}
                className={classes.tab}
                disabled={job.conclusion === "skipped"}
              />
            ))}
        </Tabs>
        {data &&
          data.jobs.map((job, index) => (
            <TabPanel value={value} index={index}>
              <TimelineComponent
                job={job}
                pipelineId={pipelineId}
                jobName={data?.jobs[value]?.name}
              />
            </TabPanel>
          ))}
      </div>
      <hr />
    </>
  );
}
