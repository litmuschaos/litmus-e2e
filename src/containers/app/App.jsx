import React, { useEffect, useState } from "react";
import { LitmusThemeProvider } from "litmus-ui";
import { Router } from "react-router-dom";
import history from "utils/history";
import sendGetRequest from "api/sendRequest";
import endpoints from "constants/endpoints";
import filterWorkflow from "api/filterWorkflow";
import { getLocalStorage, setLocalStorage } from "shared/storageHelper";
import Routes from "./Routes";

const App = () => {
  const [pipelineData, setPipelineData] = useState(null);
  useEffect(() => {
    if (
      !getLocalStorage("manualRuns") ||
      !getLocalStorage("nightlyRuns") ||
      !pipelineData
    ) {
      sendGetRequest(endpoints.allWorkflows()).then((data) => {
        const { nightly, manual } = filterWorkflow(data);
        setLocalStorage("nightlyRuns", nightly);
        setLocalStorage("manualRuns", manual);
        setPipelineData({ nightly, manual });
      });
    }
  }, [pipelineData]);

  return (
    <LitmusThemeProvider>
      <Router history={history}>
        <Routes />
      </Router>
    </LitmusThemeProvider>
  );
};

export default App;
