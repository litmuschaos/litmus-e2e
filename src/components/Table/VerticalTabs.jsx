import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GitHubIcon from "@material-ui/icons/GitHub";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import { OutlinedPills, Icon } from "litmus-ui";
import CustomRadialChart from "components/CustomRadialChart";
import { getTotalPipelineTime } from "shared/helper";
import TimelineComponent from "./TimelineComponent";
import { jobStepResult } from "./helper";

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
  skipped: "succeeded",
  stale: "succeeded",
  startup_failure: "failed",
  success: "succeeded",
  timed_out: "failed",
};

const a11yProps = (index) => ({
  id: `vertical-tab-${index}`,
  "aria-controls": `vertical-tabpanel-${index}`,
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "max-content",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tab: {
    "& span.MuiTab-wrapper": {
      alignItems: "flex-start",
    },
  },
  outlinedPills: {
    display: "block",
    margin: "0.5rem",
    width: "min-content",
    borderRadius: "1rem",
    padding: "0.5rem 1rem 1.5rem 1rem",
    fontWeight: "500",
  },
}));

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
            >
              {pipelineId}
              <Icon name="externalLink" />
            </a>
            <br />
            <Icon name="clock" size="sm" /> {getTotalPipelineTime(data?.jobs)}{" "}
            <br />
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
                />
                <a
                  href={data.jobs[value].html_url}
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
              />
            ))}
        </Tabs>
        {data &&
          data.jobs.map((job, index) => (
            <TabPanel value={value} index={index}>
              <TimelineComponent job={job} />
            </TabPanel>
          ))}
      </div>
      <hr />
    </>
  );
}
