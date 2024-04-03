export const create_env = `
    mutation createEnvironment($projectID: ID!, $request: CreateEnvironmentRequest!) {
        createEnvironment(request: $request, projectID: $projectID) {
        environmentID
        name
        description
        tags
        projectID
        type
        createdAt
        updatedAt
        isRemoved
        infraIDs
        __typename
        }
  }`

export const register_infra = `
    mutation registerInfra($projectID: ID!, $request: RegisterInfraRequest!) {
        registerInfra(projectID: $projectID, request: $request) {
        manifest
        }
    }
`

export const list_infra = `
    query listInfras($projectID: ID!, $request: ListInfraRequest) {
    listInfras(projectID: $projectID, request: $request) {
        totalNoOfInfras
        infras {
        infraID
        name
        environmentID
        description
        platformName
        isActive
        isInfraConfirmed
        updatedAt
        createdAt
        noOfExperiments
        noOfExperimentRuns
        lastExperimentTimestamp
        infraNamespace
        serviceAccount
        infraScope
        startTime
        version
        tags
        updateStatus
        __typename
        }
        __typename
    }
    }
`

export const update_infra = `
    query getInfraManifest($projectID: ID!, $infraID: ID!, $upgrade: Boolean!) {
        getInfraManifest(projectID: $projectID, infraID: $infraID, upgrade: $upgrade)
}
`

export const delete_infra = `
    mutation deleteInfra($projectID: ID!, $infraID: String!) {
    deleteInfra(projectID: $projectID, infraID: $infraID)
    }
`