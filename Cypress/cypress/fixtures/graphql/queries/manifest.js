export const GET_MANIFEST_TEMPLATE = `
  query listWorkflowManifests($projectID: String!){
    listWorkflowManifests(projectID: $projectID){
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

export const GET_TEMPLATE_BY_ID = `
  query getWorkflowManifestByID($projectID: String!, $templateID: String!){
    getWorkflowManifestByID(projectID: $projectID, templateID: $templateID){
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
