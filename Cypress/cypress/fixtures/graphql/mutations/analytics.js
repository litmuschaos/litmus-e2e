export const CREATE_DATASOURCE = `
  mutation createDataSource($DSInput: DSInput) {
    createDataSource(datasource: $DSInput) {
      dsID
      dsName
      dsType
      dsURL
      accessType
      authType
      basicAuthUsername
      basicAuthPassword
      scrapeInterval
      queryTimeout
      httpMethod
      projectID
      healthStatus
    }
  }
`;

export const UPDATE_DATASOURCE = `
  mutation updateDataSource($DSInput: DSInput!) {
    updateDataSource(datasource: $DSInput) {
      dsID
      dsName
      dsType
      dsURL
      accessType
      authType
      basicAuthUsername
      basicAuthPassword
      scrapeInterval
      queryTimeout
      httpMethod
      projectID
    }
  }
`;

export const DELETE_DATASOURCE = `
  mutation deleteDataSource(
    $projectID: String!
    $deleteDSInput: deleteDSInput!
  ) {
    deleteDataSource(projectID: $projectID, input: $deleteDSInput)
  }
`;

export const CREATE_DASHBOARD = `
  mutation createDashBoard($dashboard: CreateDBInput!) {
    createDashBoard(dashboard: $dashboard) {
      dbID
    }
  }
`;

export const UPDATE_DASHBOARD = `
  mutation updateDashboard(
    $projectID: String!
    $dashboard: UpdateDBInput!
    $chaosQueryUpdate: Boolean!
  ) {
    updateDashboard(
      projectID: $projectID
      dashboard: $dashboard
      chaosQueryUpdate: $chaosQueryUpdate
    )
  }
`;

export const DELETE_DASHBOARD = `
  mutation deleteDashboard($projectID: String!, $dbID: String) {
    deleteDashboard(projectID: $projectID, dbID: $dbID)
  }
`;

export const UPDATE_PANEL = `
  mutation updatePanel($panelInput: [panel]) {
    updatePanel(panelInput: $panelInput)
  }
`;
