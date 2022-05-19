export const CORE_CHART_FIELDS = `
  fragment CoreChartFields on Chart {
    apiVersion
    kind
    metadata {
      name
      version
      annotations {
        categories
        vendor
        createdAt
        repository
        support
        chartDescription
      }
    }
    spec {
      displayName
      categoryDescription
      keywords
      maturity
      experiments
      maintainers {
        name
        email
      }
      minKubeVersion
      provider {
        name
      }
      links {
        name
        url
      }
      chaosExpCRDLink
      platforms
      chaosType
    }
    packageInfo {
      packageName
      experiments {
        name
        CSV
        desc
      }
    }
  }
`;

export const GET_CHARTS_DATA = `
  ${CORE_CHART_FIELDS}
  query listCharts($hubName: String!, $projectID: String!) {
    listCharts(hubName: $hubName, projectID: $projectID) {
      ...CoreChartFields
    }
  }
`;

export const GET_EXPERIMENT_DATA = `
  ${CORE_CHART_FIELDS}
  query getHubExperiment($request: ExperimentRequest!) {
    getHubExperiment(request: $request) {
      ...CoreChartFields
    }
  }
`;

export const GET_HUB_STATUS = `
  query listHubStatus($projectID: String!) {
    listHubStatus(projectID: $projectID) {
      id
      hubName
      repoBranch
      repoURL
      totalExp
      isAvailable
      authType
      isPrivate
      token
      userName
      password
      sshPrivateKey
      sshPublicKey
      lastSyncedAt
    }
  }
`;

export const GET_PREDEFINED_EXPERIMENT_YAML = `
  query getPredefinedExperimentYAML($request: ExperimentRequest!) {
    getPredefinedExperimentYAML(request: $request)
  }
`;

export const GET_ENGINE_YAML = `
  query getEngineData($request: ExperimentRequest!) {
    getYAMLData(request: $request)
  }
`;

export const GET_EXPERIMENT_YAML = `
  query getYAMLData($request: ExperimentRequest!) {
    getYAMLData(request: $request)
  }
`;
