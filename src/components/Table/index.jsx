import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@material-ui/data-grid";
import { Typography } from "@material-ui/core";
import { Drawer, TextButton } from "litmus-ui";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import CustomRadialChart from "components/CustomRadialChart";
import { readableNameConverter } from "shared/helper";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";
import VerticalTabs from "./VerticalTabs";
import { descriptionMapping } from "./helper";
import useStyles from "./styles";

const DataTable = ({
  data,
  tableName,
  match: { params: { pipelineName } = {} } = {},
  displayVersion = true,
}) => {
  const [pageSize, setPageSize] = useState(10);
  const [pipelineDetails, setPipelineDetails] = useState(null);
  const [displayDrawer, setDisplayDrawer] = useState(false);
  const [githubRepo, setGithubRepo] = useState("litmus-go");
  const classes = useStyles();
  const { t } = useTranslation();
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDisplayDrawer(open);
  };
  const fetchPipelineDetails = (pipelineId) => {
    sendGetRequest(endpoints.pipelineJobs(pipelineId)).then((response) => {
      setPipelineDetails({ pipelineId, jobs: response });
      setDisplayDrawer(true);
    });
  };
  const columns = [
    {
      field: "id",
      headerName: "Pipeline Id",
      flex: 1,
      renderCell: (params) => (
        <TextButton
          size="small"
          variant="highlight"
          onClick={() => fetchPipelineDetails(params.value)}
        >
          {params.value}
        </TextButton>
      ),
    },
    {
      field: "created_at",
      headerName: "Created Time",
      flex: 1,
      renderCell: (params) =>
        `${formatDistanceToNowStrict(new Date(params.value))} ago`,
    },
    {
      field: "head_commit",
      headerName: "Description",
      flex: 1,
      renderCell: (params) => (
        <>
          <a
            href={`https://github.com/litmuschaos/${githubRepo}/commit/${params.value.id}`}
          >
            {`#${params.value.id.substring(0, 6)}`}
          </a>{" "}
          &nbsp; {t("table.repository")}: {githubRepo}
        </>
      ),
    },
    ...(displayVersion
      ? [
          {
            field: "version",
            headerName: "Version",
            flex: 1,
            renderCell: () => "ci",
          },
        ]
      : []),
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: () => <CustomRadialChart pass={4} fail={2} pending={1} />,
    },
  ];
  useEffect(() => {
    if (
      tableName?.match(/.*Portal.*$/) != null ||
      pipelineName?.match(/.*Portal.*$/)
    ) {
      setGithubRepo("litmus");
    }
  }, []);
  return (
    <>
      <Typography
        variant="h3"
        component="h2"
        align="center"
        className={classes.topMargin}
      >
        {readableNameConverter(tableName) ||
          readableNameConverter(pipelineName)}
      </Typography>
      <Typography
        variant="subtitle1"
        component="h3"
        align="center"
        className={classes.topMargin}
      >
        {descriptionMapping[tableName] || descriptionMapping[pipelineName]}
      </Typography>
      <br />
      {data && (
        <DataGrid
          rows={data}
          columns={columns}
          id={tableName || pipelineName}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          pagination
          disableSelectionOnClick
        />
      )}
      <Drawer
        anchor="right"
        icon="close"
        variant="temporary"
        onButtonClose={toggleDrawer(false)}
        onClose={toggleDrawer(false)}
        open={displayDrawer}
      >
        <div className={classes.drawerContainer}>
          <VerticalTabs
            data={pipelineDetails?.jobs}
            pipelineId={pipelineDetails?.pipelineId}
          />
        </div>
      </Drawer>
    </>
  );
};

export default DataTable;
