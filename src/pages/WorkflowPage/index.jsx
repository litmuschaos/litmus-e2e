import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Typography } from "litmus-ui";
import Table from "components/Table";
import { getLocalStorage } from "shared/storageHelper";
import { readableNameConverter } from "shared/helper";
import { jobStepResult, descriptionMapping } from "shared/job";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";
import CustomRadialChart from "components/CustomRadialChart";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  label: {
    color: "#0000008a",
  },
  flexSpace: {
    display: "flex",
    justifyContent: "space-between",
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

const WorkflowPage = ({
  location,
  pipelineData,
  match: { params: { pipelineName } = {} } = {},
}) => {
  const classes = useStyles();
  const [selectedPipeline, setSelectedPipeline] = useState({
    id: location?.state?.id || "",
    readableName: location?.state?.readableName || "",
  });
  const [workflowData, setWorkflowData] = useState(null);
  const manualData = pipelineData?.manual || getLocalStorage("manualRuns");
  const nightlyData = pipelineData?.nightly || getLocalStorage("nightlyRuns");
  const allData = [...manualData, ...nightlyData];
  const handleChange = (event) => {
    setSelectedPipeline({
      id: event.target.value,
      readableName: event.target.options[event.target.selectedIndex].text,
    });
  };
  useEffect(() => {
    if (selectedPipeline.id) {
      let pipelines;
      sendGetRequest(endpoints.pipelinesByWorkflow(selectedPipeline.id)).then(
        (data) => {
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
            setWorkflowData(pipelines);
          });
        }
      );
    }
  }, [selectedPipeline.id]);
  const { t } = useTranslation();
  return (
    <>
      <div className={classes.flexSpace}>
        <div className={classes.flexStart}>
          <Typography>{t("pipelinePage.selectPipeline")}:</Typography>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel
              htmlFor="outlined-pipelineName"
              className={classes.label}
            >
              {t("pipelinePage.pipelineName")}
            </InputLabel>
            <Select
              native
              value={selectedPipeline.id}
              onChange={handleChange}
              label="pipelineName"
              inputProps={{
                name: "pipelineName",
                id: "outlined-pipelineName",
              }}
            >
              <option aria-label="None" value="" />
              {allData &&
                allData.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.readableName}
                  </option>
                ))}
            </Select>
          </FormControl>
        </div>
        <div className={classes.m0}>
          <Typography
            variant="heading3"
            component="h2"
            align="center"
            className={classes.topMargin}
          >
            {readableNameConverter(selectedPipeline?.readableName) ||
              readableNameConverter(pipelineName)}
          </Typography>
          <Typography
            component="h3"
            align="center"
            className={classes.topMargin}
          >
            {descriptionMapping[selectedPipeline?.readableName] ||
              descriptionMapping[pipelineName]}
          </Typography>
        </div>
        {selectedPipeline.id && (
          <div>
            <CustomRadialChart
              pass={20}
              fail={5}
              pending={2}
              size="large"
              heading="Test Coverage"
            />
          </div>
        )}
      </div>
      {selectedPipeline.id && workflowData && (
        <Table
          tableName={selectedPipeline.readableName}
          data={workflowData}
          displayVersion={false}
        />
      )}
    </>
  );
};

export default WorkflowPage;
