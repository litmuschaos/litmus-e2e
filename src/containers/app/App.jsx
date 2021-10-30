import React, { useEffect, useState } from "react";
import { LitmusThemeProvider } from "litmus-ui";
import { Router } from "react-router-dom";
import history from "utils/history";
import sendGetRequest from "api/sendRequest";
import endpoints from "constants/endpoints";
import filterWorkflow from "api/filterWorkflow";
import filterPipelines from "api/filterPipelines";
import { getLocalStorage, setLocalStorage } from "shared/storageHelper";
import Routes from "./Routes";

const App = () => {
  const [pipelineData, setPipelineData] = useState(null);
  useEffect(() => {
    if (
      !getLocalStorage("manualRuns") ||
      !getLocalStorage("nightlyRuns") ||
      !getLocalStorage("allRuns") ||
      !pipelineData
    ) {
      sendGetRequest(endpoints.allWorkflows())
        .then((data) => {
          const pipelines = filterWorkflow(data);
          filterPipelines(pipelines).then(({ nightly, manual, all }) => {
            setLocalStorage("nightlyRuns", nightly);
            setLocalStorage("manualRuns", manual);
            setLocalStorage("allRuns", all);
            setPipelineData({ nightly, manual, all });
          });
        })
        .catch(() => {});
      if (!getLocalStorage("litmusGoCommits")) {
        sendGetRequest(endpoints.commits())
          .then((data) => {
            setLocalStorage("litmusGoCommits", data);
          })
          .catch(() => {});
      }
    }
  }, [pipelineData]);

  return (
    <LitmusThemeProvider>
      <Router history={history}>
        <Routes pipelineData={pipelineData} />
      </Router>
    </LitmusThemeProvider>
  );
};

export default App;
