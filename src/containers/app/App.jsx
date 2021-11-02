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
          ...(mode === "light"
            ? {
                primary: {
                  main: "#5B44BA",
                  light: "#858CDD",
                  dark: "#4028A0",
                },
                secondary: {
                  main: "#109B67",
                  light: "#109B6799",
                  dark: "#128359",
                },
                graph: {
                  dashboard: {
                    lightBlue: "#08BBD7",
                    lightOrange: "#F6B92B",
                  },
                  toolTip: "#5252F6",
                  legendTableHeading: "#0098DD",
                  radialChartPassed: "#0098DD",
                  line: [
                    "#A93DDB",
                    "#A05195",
                    "#D45087",
                    "#CC556A",
                    "#FFA600",
                    "#DFA73E",
                    "#F6793E",
                    "#6DA966",
                    "#51C9DA",
                    "#2F4B7C",
                  ],
                  area: [
                    "#A93DDB73",
                    "#A0519573",
                    "#A4508773",
                    "#CC556A73",
                    "#FFA60073",
                    "#DFA73E73",
                    "#F6793E73",
                    "#6DA96673",
                    "#51C9DA73",
                    "#2F4B7C73",
                  ],
                  calendarHeatmap: [
                    "#FD6868",
                    "#FE9A9A",
                    "#FDB4B4",
                    "#EECC91",
                    "#E3AD4F",
                    "#E79F32",
                    "#9BE9A8",
                    "#40C463",
                    "#109B67",
                    "#E5E7F1",
                    "#BDC3DB",
                  ],
                },
                success: {
                  main: "#109B67",
                  light: "#109B6710",
                  dark: "#128359",
                },
                error: {
                  light: "#CA2C2C10",
                  main: "#CA2C2C",
                  dark: "#A62F28",
                },
                warning: {
                  light: "#F6B92B20",
                  main: "#DBA017",
                  dark: "#402C01",
                },
                background: {
                  default: "#F5F6F8",
                  paper: "#FFFFFF",
                },
                sidebarMenu: "#F5F6F8",
                header:
                  "linear-gradient(269.82deg, #5B44BA 0.52%, #493795 99.07%)",
                loginBackground:
                  "linear-gradient(78.42deg, #403083 0.01%, #5B44BA 100.01%)",
                disabledBackground: "#D9D9D9",
                text: {
                  primary: "#1C0732",
                  secondary: "#FFFFFF",
                  disabled: "#BCB9C6",
                  hint: "#696F8C",
                },
                highlight: "#5B44BA",
                horizontalStepper: {
                  completed: "#5D6173",
                  active: "#2CCA8F",
                  pending: "#B9B9B9",
                },
                border: {
                  main: "#BBBBBB",
                  success: "#109B67",
                  error: "#CA2C2C",
                },
                progressBarGradient:
                  "linear-gradient(90.43deg, #5B44BA 0.35%, #858CDD 51.03%, #109B67 99.64%)",
                status: {
                  workflow: {
                    running: "#3A97D4",
                    completed: "#09825D",
                    failed: "#DD2B0E",
                    pending: "#949AB7",
                  },
                  experiment: {
                    running: "#5469D4",
                    completed: "#00CC9A",
                    failed: "#F2536D",
                    pending: "#BBBBBB",
                    skipped: "#0098DD",
                    error: "#FFA600",
                    omitted: "#A93DDB",
                  },
                },
                cards: {
                  header: "#EDF0F8",
                  background: "#FFFFFF",
                  highlight: "#8F96E066",
                },
                icon: {
                  primary: "white",
                },
              }
            : {
                primary: {
                  main: "#5B44BA",
                  light: "#858CDD",
                  dark: "#4028A0",
                },
                icon: {
                  primary: "black",
                },
                background: {
                  default: "#121212",
                  paper: "#272c34",
                },
                text: {
                  primary: "#FFFFFF",
                  secondary: "#FFFFFF",
                  disabled: "#BCB9C6",
                  hint: "#696F8C",
                },
                status: {
                  workflow: {
                    running: "#3A97D4",
                    completed: "#09825D",
                    failed: "#DD2B0E",
                    pending: "#949AB7",
                  },
                  experiment: {
                    running: "#5469D4",
                    completed: "#00CC9A",
                    failed: "#F2536D",
                    pending: "#BBBBBB",
                    skipped: "#0098DD",
                    error: "#FFA600",
                    omitted: "#A93DDB",
                  },
                },
              }),
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
        sendGetRequest(endpoints.commits())
          .then((data) => {
            setLocalStorage("litmusGoCommits", data);
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
