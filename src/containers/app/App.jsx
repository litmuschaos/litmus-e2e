import React, { useEffect, useState } from "react";
import { LitmusThemeProvider, createTheme } from "litmus-ui";
import { Router } from "react-router-dom";
import history from "utils/history";
import sendGetRequest from "api/sendRequest";
import endpoints from "constants/endpoints";
import filterWorkflow from "api/filterWorkflow";
import filterPipelines from "api/filterPipelines";
import { getLocalStorage, setLocalStorage } from "shared/storageHelper";
import ColorModeContext from "shared/ColorModeContext";
import { lightTheme, darkTheme } from "constants/theme";
import Routes from "./Routes";

const App = () => {
  const [pipelineData, setPipelineData] = useState(null);
  const [mode, setMode] = React.useState("light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light" ? lightTheme : darkTheme),
        },
      }),
    [mode]
  );
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
        sendGetRequest(endpoints.commits("litmus-go"))
          .then((data) => {
            setLocalStorage("litmusGoCommits", data);
          })
          .catch(() => {});
      }
      if (!getLocalStorage("litmusCommits")) {
        sendGetRequest(endpoints.commits("litmus"))
          .then((data) => {
            setLocalStorage("litmusCommits", data);
          })
          .catch(() => {});
      }
    }
  }, [pipelineData]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <LitmusThemeProvider theme={theme}>
        <Router history={history}>
          <Routes pipelineData={pipelineData} />
        </Router>
      </LitmusThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
