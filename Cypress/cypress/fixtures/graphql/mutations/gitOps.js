export const ENABLE_GITOPS = `
  mutation enableGitOps($config: GitConfigResponse!) {
    enableGitOps(config: $config)
  }
`;

export const UPDATE_GITOPS = `
  mutation updateGitOps($config: GitConfigResponse!) {
    updateGitOps(config: $config)
  }
`;

export const DISABLE_GITOPS = `
  mutation disableGitOps($projectID: String!) {
    disableGitOps(projectID: $data)
  }
`;
