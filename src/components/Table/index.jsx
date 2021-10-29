import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@material-ui/data-grid";
import { Drawer, TextButton } from "litmus-ui";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import CustomRadialChart from "components/CustomRadialChart";
import endpoints from "constants/endpoints";
import sendGetRequest from "api/sendRequest";
import { getLocalStorage } from "shared/storageHelper";
import VerticalTabs from "./VerticalTabs";
import useStyles from "./styles";

const DataTable = ({
  data,
  tableName,
  match: { params: { pipelineName } = {} } = {},
  displayVersion = true,
  displayPipelineName = false,
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
  const updateCommit = () => {
    const litmusGoCommits = getLocalStorage("litmusGoCommits");
    for (let i = 0; i < data.length; ++i) {
      // eslint-disable-next-line no-param-reassign
      data[i].litmusGoCommits = {
        html_url: litmusGoCommits?.[i]?.html_url,
        sha: litmusGoCommits?.[i]?.sha,
      };
    }
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
      field: "litmusGoCommits",
      headerName: "Description",
      flex: 1,
      renderCell: (params) => (
        <>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={params.value?.html_url}
          >
            {`#${params.value.sha.substring(0, 6)}`}
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
    ...(displayPipelineName
      ? [
          {
            field: "name",
            headerName: "Pipeline Name",
            flex: 1,
          },
        ]
      : []),
    {
      field: "status",
      headerName: "Pipeline Job Status",
      flex: 1,
      renderCell: (params) => (
        <CustomRadialChart
          pass={params.value?.pass || 0}
          fail={params.value?.fail || 0}
          pending={params.value?.pending || 0}
        />
      ),
    },
  ];
  useEffect(() => {
    if (
      tableName?.match(/.*Portal.*$/) != null ||
      pipelineName?.match(/.*Portal.*$/)
    ) {
      setGithubRepo("litmus");
    }
    updateCommit();
  }, []);
  return (
    <>
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
