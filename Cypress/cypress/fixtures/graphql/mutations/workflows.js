export const CREATE_WORKFLOW = `
  mutation createChaosWorkFlow($request: ChaosWorkFlowRequest!){
    createChaosWorkFlow(request: $request){
      workflowID
      cronSyntax
      workflowName
      workflowDescription
      isCustomWorkflow
    }
  }
`;

export const UPDATE_SCHEDULE = `
  mutation updateChaosWorkflow($request: ChaosWorkFlowRequest){
    updateChaosWorkflow(request: $request){
      workflowID
      cronSyntax
      workflowName
      workflowDescription
      isCustomWorkflow
    }
  }
`;

export const RERUN_CHAOS_WORKFLOW = `
  mutation reRunChaosWorkFlow($projectID: String!, $workflowID: String!){
    reRunChaosWorkFlow(projectID: $projectID, workflowID: $workflowID)
  }
`;

export const SYNC_WORKFLOW = `
  mutation syncWorkflow(
    $projectID: String!
    $workflowID: String!
    $workflowRunID: String!
  ) {
    syncWorkflow(
      projectID: $projectID
      workflowID: $workflowID
      workflowRunID: $workflowRunID
    )
  }
`;

export const DELETE_WORKFLOW = `
  mutation deleteChaosWorkflow($projectID: String!, $workflowID: String, $workflowRunID: String){
    deleteChaosWorkflow(projectID: $projectID, workflowID: $workflowID, workflowRunID: $workflowRunID)
  }
`;

export const TERMINATE_WORKFLOW = `
  mutation terminateWorkflow(
    $projectID: String!
    $workflowID: String
    $workflowRunID: String
  ) {
    terminateChaosWorkflow(
      projectID: $projectID
      workflowID: $workflowID
      workflowRunID: $workflowRunID
    )
  }
`;
