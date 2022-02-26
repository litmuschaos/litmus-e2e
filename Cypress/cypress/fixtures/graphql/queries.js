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

export const getCluster = `query getCluster($project_id: String!, $cluster_type: String){
  getCluster(project_id: $project_id, cluster_type: $cluster_type){
    cluster_id
    project_id
    cluster_name
    description
    platform_name
    access_key
    is_registered
    is_cluster_confirmed
    is_active
    updated_at
    created_at
    cluster_type
    no_of_schedules
    no_of_workflows
    token
    agent_namespace
    serviceaccount
    agent_scope
    agent_ns_exists
    agent_sa_exists
    last_workflow_timestamp
    start_time
    version
  }
}`;
