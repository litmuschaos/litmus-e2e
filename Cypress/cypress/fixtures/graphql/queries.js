export const getHubStatus = `query getHubStatus($projectID: String!){
  getHubStatus(projectID: $projectID){
    id
    RepoURL
    RepoBranch
    IsAvailable
    TotalExp
    HubName
    IsPrivate
    AuthType
    Token
    UserName
    Password
    IsRemoved
    SSHPrivateKey
    SSHPublicKey
    LastSyncedAt
  }
}`;

export const getCharts = `query getCharts($HubName: String!, $projectID: String!){
  getCharts(HubName: $HubName, projectID: $projectID){
    ApiVersion
    Kind
  }
}`;

export const getHubExperiment = `query getHubExperiment($experimentInput: ExperimentInput!){
  getHubExperiment(experimentInput: $experimentInput){
    ApiVersion
    Kind
  }
}`;

export const getYAMLData = `query getYAMLData($experimentInput: ExperimentInput!){
  getYAMLData(experimentInput: $experimentInput)
}`;

export const GetPredefinedWorkflowList = `query GetPredefinedWorkflowList($HubName: String!, $projectID: String!){
  GetPredefinedWorkflowList(HubName: $HubName, projectID: $projectID)
}`;

export const GetPredefinedExperimentYAML = `query GetPredefinedExperimentYAML($experimentInput: ExperimentInput!){
  GetPredefinedExperimentYAML(experimentInput: $experimentInput)
}`;