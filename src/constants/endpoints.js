const baseUrl = "https://api.github.com";

const endpoints = {
  allWorkflows: () =>
    `${baseUrl}/repos/litmuschaos/litmus-e2e/actions/workflows`,
  allPipelines: () => `${baseUrl}/repos/litmuschaos/litmus-e2e/actions/runs`,
  pipelinesByWorkflow: (workflowName) =>
    `${baseUrl}/repos/litmuschaos/litmus-e2e/actions/workflows/${workflowName}/runs`,
  pipelineJobs: (pipelineId) =>
    `${baseUrl}/repos/litmuschaos/litmus-e2e/actions/runs/${pipelineId}/jobs`,
  releaseTag: () => `${baseUrl}/repos/litmuschaos/litmus/releases/latest`,
  repoDetails: () => `${baseUrl}/repos/litmuschaos/litmus`,
};

export default endpoints;
