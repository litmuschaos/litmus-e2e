import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "litmus-ui";
import Table from "components/Table";
import { jobStepResult } from "shared/job";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";
import CustomRadialChart from "components/CustomRadialChart";

const useStyles = makeStyles(() => ({
  flexSpace: {
    display: "flex",
    justifyContent: "center",
  },
  flexStart: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  m0: {
    margin: "auto 0",
  },
}));

const AllWorkflows = () => {
  const classes = useStyles();
  const [pipelineData, setPipelineData] = useState(null);
  useEffect(() => {
    let pipelines;
    sendGetRequest(endpoints.allPipelines()).then((data) => {
      pipelines = data?.workflow_runs;
      const promiseList = [];
      pipelines?.forEach((pipeline, index) => {
        promiseList.push(
          sendGetRequest(endpoints.pipelineJobs(pipeline?.id)).then(
            (response) => {
              pipelines[index].status = jobStepResult(response?.jobs);
            }
          )
        );
      });
      Promise.all(promiseList).then(() => {
        setPipelineData(pipelines);
      });
    });
  }, []);
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.flexSpace}>
        <div className={classes.m0}>
          <Typography
            variant="heading3"
            component="h2"
            align="center"
            className={classes.topMargin}
          >
            {t("pipelinePage.allWorkflows")}
          </Typography>
          <Typography
            component="h3"
            align="center"
            className={classes.topMargin}
          >
            {t("pipelinePage.allWorkflowsDesc")}
          </Typography>
        </div>
        <div>
          <CustomRadialChart
            pass={20}
            fail={5}
            pending={2}
            size="large"
            heading="Test Coverage"
          />
        </div>
      </div>
      {pipelineData && (
        <Table
          tableName={t("pipelinePage.allWorkflows")}
          data={pipelineData}
          displayVersion={false}
          displayPipelineName
        />
      )}
    </>
  );
};

export default AllWorkflows;
