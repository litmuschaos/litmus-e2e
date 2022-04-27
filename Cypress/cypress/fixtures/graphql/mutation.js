export const addMyHub = `mutation addMyHub($myhubInput: CreateMyHub!, $projectID: String!){
  addMyHub(myhubInput: $myhubInput, projectID: $projectID){
    id
    RepoURL
    RepoBranch
    ProjectID
    HubName
    IsPrivate
    AuthType
    Token
    UserName
    Password
    SSHPrivateKey
    IsRemoved
    CreatedAt
    UpdatedAt
    LastSyncedAt
  }
}`;

export const updateMyHub = `mutation updateMyHub($myhubInput: UpdateMyHub!, $projectID: String!){
  updateMyHub(myhubInput: $myhubInput, projectID: $projectID){
    id
    RepoURL
    RepoBranch
    ProjectID
    HubName
    IsPrivate
    AuthType
    Token
    UserName
    Password
    SSHPrivateKey
    IsRemoved
    CreatedAt
    UpdatedAt
    LastSyncedAt
  }
}`;

export const deleteMyHub = `mutation deleteMyHub($hub_id: String!){
  deleteMyHub(hub_id: $hub_id)
}`;

export const syncHub = `mutation syncHub($id: ID!){
  syncHub(id: $id){
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

export const userClusterReg = `mutation userClusterReg($clusterInput: ClusterInput!){
  userClusterReg(clusterInput: $clusterInput){
    token
    cluster_id
    cluster_name
  }
}`;

export const deleteClusters = `mutation deleteClusters($projectID: String!, $cluster_ids: [String]!) {
  deleteClusters(projectID: $projectID, cluster_ids: $cluster_ids)
}`;

export const createChaosWorkFlow = `mutation createChaosWorkFlow($input: ChaosWorkFlowInput!){
  createChaosWorkFlow(input: $input){
    workflow_id
    cronSyntax
    workflow_name
    workflow_description
    isCustomWorkflow
  }
}`;

export const reRunChaosWorkFlow = `mutation reRunChaosWorkFlow($projectID: String!, $workflowID: String!){
  reRunChaosWorkFlow(projectID: $projectID, workflowID: $workflowID)
}`;

export const updateChaosWorkflow = `mutation updateChaosWorkflow($input: ChaosWorkFlowInput){
  updateChaosWorkflow(input: $input){
    workflow_id
    cronSyntax
    workflow_name
    workflow_description
    isCustomWorkflow
  }
}`;

export const deleteChaosWorkflow = `mutation deleteChaosWorkflow($projectID: String!, $workflowID: String, $workflow_run_id: String){
  deleteChaosWorkflow(projectID: $projectID, workflowID: $workflowID, workflow_run_id: $workflow_run_id)
}`;

export const createManifestTemplate = `mutation createManifestTemplate($templateInput: TemplateInput){
  createManifestTemplate(templateInput: $templateInput){
    template_id
    manifest
    template_name
    template_description
    project_id
    project_name
    created_at
    is_removed
    isCustomWorkflow
  }
}`;
