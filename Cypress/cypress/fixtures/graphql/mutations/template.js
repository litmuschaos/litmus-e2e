export const ADD_WORKFLOW_TEMPLATE = `
  mutation createWorkflowTemplate($request: TemplateInput){
    createWorkflowTemplate(request: $request){
      templateID
      manifest
      templateName
      templateDescription
      projectID
      projectName
      createdAt
      isRemoved
      isCustomWorkflow
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE = `
  mutation deleteWorkflowTemplate($projectID: String!, $templateID: String!) {
    deleteWorkflowTemplate(projectID: $projectID, templateID: $templateID)
  }
`;
