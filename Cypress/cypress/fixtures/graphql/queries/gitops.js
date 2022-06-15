export const GET_GITOPS_DATA = `
  query getGitOpsDetails($projectID: String!) {
    getGitOpsDetails(projectID: $projectID) {
      enabled
      projectID
      branch
      repoURL
      authType
      token
      userName
      password
      sshPrivateKey
    }
  }
`;
