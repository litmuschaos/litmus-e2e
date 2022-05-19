export const ENABLE_GITOPS = `
  mutation enableGitOps($config: GitConfig!) {
    enableGitOps(config: $config)
  }
`;

export const UPDATE_GITOPS = `
  mutation updateGitOps($config: GitConfig!) {
    updateGitOps(config: $config)
  }
`;

export const DISABLE_GITOPS = `
  mutation disableGitOps($projectID: String!){
    disableGitOps(projectID: $projectID)
  }
`;
