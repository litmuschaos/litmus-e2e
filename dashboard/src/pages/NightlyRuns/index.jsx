import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Typography } from "litmus-ui";
import Center from "containers/layouts/Center";
import Table from "components/Table";
import CustomRadialChart from "components/CustomRadialChart";
import { getLocalStorage } from "shared/storageHelper";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  label: {
    color: "#0000008a",
  },
}));

const NightlyRuns = ({ location }) => {
  const classes = useStyles();
  const [selectedPipeline, setSelectedPipeline] = useState({
    id: location?.state?.id || "",
    readableName: location?.state?.readableName || "",
  });
  const [pipelineData, setPipelineData] = useState(null);
  const manualData = getLocalStorage("nightlyRuns");
  const handleChange = (event) => {
    setSelectedPipeline({
      id: event.target.value,
      readableName: event.target.options[event.target.selectedIndex].text,
    });
  };
  useEffect(() => {
    if (selectedPipeline.id) {
      sendGetRequest(endpoints.pipelinesByWorkflow(selectedPipeline.id)).then(
        (data) => {
          setPipelineData(data?.workflow_runs);
        }
      );
    }
  }, [selectedPipeline.id]);
  const { t } = useTranslation();
  return (
    <>
      <Center>
        <Typography>{t("pipelinePage.selectNightly")}:</Typography>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel htmlFor="outlined-pipelineName" className={classes.label}>
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
            {manualData &&
              manualData.map((manualItem) => (
                <option value={manualItem.id} key={manualItem.id}>
                  {manualItem.readableName}
                </option>
              ))}
          </Select>
        </FormControl>
      </Center>
      {selectedPipeline.id && pipelineData && (
        <>
          <Center>
            <CustomRadialChart pass={20} fail={5} pending={2} size="large" />
          </Center>
          <Table
            tableName={selectedPipeline.readableName}
            data={pipelineData}
            displayVersion={false}
          />
        </>
      )}
    </>
  );
};

export default NightlyRuns;
