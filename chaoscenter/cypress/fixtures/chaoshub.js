export const add_hub = `
    mutation addChaosHub($projectID: ID!, $request: CreateChaosHubRequest!) {
        addChaosHub(request: $request, projectID: $projectID) {
            name
            repoURL
            repoBranch
            hubType
            isPrivate
            __typename
        }
    }
    `

export const update_hub =`
    mutation updateChaosHub($projectID: ID!, $request: UpdateChaosHubRequest!) {
        updateChaosHub(projectID: $projectID, request: $request) {
            name
            repoURL
            repoBranch
            __typename
        }
    }
    `

export const delete_hub =`
    mutation deleteChaosHub($hubID: ID!, $projectID: ID!) {
        deleteChaosHub(hubID: $hubID, projectID: $projectID)
}
`
export const list_hub = `
    query listChaosHub($projectID: ID!, $request: ListChaosHubRequest!) {
        listChaosHub(projectID: $projectID, request: $request) {
            id
            repoURL
            repoBranch
            authType
            isAvailable
            totalFaults
            totalExperiments
            name
            token
            sshPublicKey
            sshPrivateKey
            lastSyncedAt
            tags
            isDefault
            isPrivate
            createdBy {
            username
            }
            updatedBy {
            username
            }
            createdAt
            updatedAt
            description
    }
}
`
