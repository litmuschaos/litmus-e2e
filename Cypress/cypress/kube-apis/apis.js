// This file contains a variable "apis", which exports different functions
// which help in generating routes for accessing kube-api-server through REST API.
// For more details, refer https://kubernetes.io/docs/reference/kubernetes-api/

// Before using the apis, CYPRESS_KUBE_API_SERVER & CYPRESS_KUBE_API envs needs to be set.
// For Settings the ENVs, refer https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/#without-kubectl-proxy

// Also, RBAC needs to be applied on the cluster for allowing Cypress to access the api-server
// using provided namespace.

/* For quick setup of rbac & to get envs, 
    chmod +x kube-api-config.sh (in cypress root directory)
    ./kube-api-config.sh <YOUR_CLUSTER_NAME>
    Note the token & api-server end-point
    Set the values in cypress.json
    Start the Cypress Runner
*/

export const KUBE_API_SERVER = Cypress.env("KUBE_API_SERVER");
export const KUBE_API_TOKEN = Cypress.env("KUBE_API_TOKEN");

export const apis = {
  getWorkflows: (namespace) => {
    return `${KUBE_API_SERVER}/apis/argoproj.io/v1alpha1/namespaces/${namespace}/workflows`;
  },

  getCronWorkflows: (namespace) => {
    return `${KUBE_API_SERVER}/apis/argoproj.io/v1alpha1/namespaces/${namespace}/cronworkflows`;
  },

  getWorkflowByName: (workflowName, namespace) => {
    return `${KUBE_API_SERVER}/apis/argoproj.io/v1alpha1/namespaces/${namespace}/workflows/${workflowName}`;
  },

  getCronWorkflowByName: (workflowName, namespace) => {
    return `${KUBE_API_SERVER}/apis/argoproj.io/v1alpha1/namespaces/${namespace}/cronworkflows/${workflowName}`;
  },

  getPods: (namespace) => {
    return `${KUBE_API_SERVER}/api/v1/namespaces/${namespace}/pods`;
  },

  getPodByLabel: (namespace, label) => {
    return `${KUBE_API_SERVER}/api/v1/namespaces/${namespace}/pods?labelSelector=${label}`;
  },

  getChaosEngines: (namespace) => {
    return `${KUBE_API_SERVER}/apis/litmuschaos.io/v1alpha1/namespaces/${namespace}/chaosresults`;
  },

  createDeployment: (namespace) => {
    return `${KUBE_API_SERVER}/apis/apps/v1/namespaces/${namespace}/deployments`;
  },

  deleteDeployment: (namespace, name) => {
    return `${KUBE_API_SERVER}/apis/apps/v1/namespaces/${namespace}/deployments/${name}`;
  }
};
