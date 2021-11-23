const baseUrl = "https://e2edashboardbackend.herokuapp.com";
const orgName = "litmuschaos";

const endpoints = {
  allWorkflows: () =>
    `${baseUrl}/repos/${orgName}/litmus-e2e/actions/workflows`,
  allPipelines: () => `${baseUrl}/repos/${orgName}/litmus-e2e/actions/runs`,
  pipelinesByWorkflow: (workflowName) =>
    `${baseUrl}/repos/${orgName}/litmus-e2e/actions/workflows/${workflowName}/runs`,
  pipelineJobs: (pipelineId) =>
    `${baseUrl}/repos/${orgName}/litmus-e2e/actions/runs/${pipelineId}/jobs`,
  commits: () => `${baseUrl}/repos/${orgName}/litmus-go/commits`,
  logs: () => `${baseUrl}/logs`,
};

export default endpoints;
