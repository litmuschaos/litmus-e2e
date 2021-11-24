import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "litmus-ui";
import Table from "components/Table";
import { jobStepResult } from "shared/job";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";
import CustomRadialProgressChart from "components/CustomRadialProgressChart";
import Loader from "components/Loader";
import { nightlyRegex, manualRegex } from "constants/regex";
import useStyles from "./styles";

const AllWorkflows = () => {
  const classes = useStyles();
  const [pipelineData, setPipelineData] = useState(null);
  useEffect(() => {
    let pipelines;
    sendGetRequest(endpoints.allPipelines()).then((data) => {
      pipelines = data?.workflow_runs;
      const filteredPipelines = [];
      const promiseList = [];
      pipelines?.every((pipeline) => {
        if (
          pipeline.name.match(nightlyRegex) != null ||
          pipeline.name.match(manualRegex) != null
        ) {
          promiseList.push(
            sendGetRequest(endpoints.pipelineJobs(pipeline?.id)).then(
              (response) => {
                filteredPipelines.push({
                  ...pipeline,
                  status: jobStepResult(response?.jobs),
                });
              }
            )
          );
          if (filteredPipelines.length === 10) return false;
        }
        return true;
      });
      Promise.all(promiseList).then(() => {
        filteredPipelines.forEach((_value, index) => {
          filteredPipelines[index].index = index;
        });
        setPipelineData(filteredPipelines);
      });
    });
  }, []);
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.flexSpace}>
        <div className={classes.m0}>
          <Typography variant="heading3" component="h2" align="center">
            {t("pipelinePage.allWorkflows")}
          </Typography>
          <Typography
            component="h3"
            align="center"
            className={classes.subheading}
          >
            {t("pipelinePage.allWorkflowsDesc")}
          </Typography>
        </div>
        <div>
          <CustomRadialProgressChart
            passPercentage={60}
            heading={t("radialProgressChart.testCoverage")}
          />
        </div>
      </div>
      {pipelineData ? (
        <Table
          tableName={t("pipelinePage.allWorkflows")}
          data={pipelineData}
          displayVersion={false}
          displayPipelineName
        />
      ) : (
        <Loader />
      )}
    </>
  );
};

export default AllWorkflows;
