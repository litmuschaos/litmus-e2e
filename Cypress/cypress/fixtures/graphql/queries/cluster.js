export const GET_CLUSTER = `
  query listClusters($projectID: String!, $clusterType: String) {
    listClusters(projectID: $projectID, clusterType: $clusterType) {
      clusterID
      clusterName
      description
      isActive
      isRegistered
      isClusterConfirmed
      updatedAt
      createdAt
      clusterType
      noOfSchedules
      noOfWorkflows
      token
      lastWorkflowTimestamp
      agentNamespace
      agentScope
      version
    }
  }
`;

export const GET_CLUSTER_LENGTH = `
  query listClusters($projectID: String!) {
    listClusters(projectID: $projectID) {
      clusterID
    }
  }
`;

export const GET_CLUSTER_NAMES = `
  query listClusters($projectID: String!) {
    listClusters(projectID: $projectID) {
      clusterName
    }
  }
`;
