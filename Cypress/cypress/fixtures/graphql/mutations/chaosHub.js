export const ADD_MY_HUB = `
  mutation addChaosHub($request: CreateChaosHubRequest!){
    addChaosHub(request: $request){
      id
      repoURL
      repoBranch
      projectID
      hubName
      isPrivate
      authType
      token
      userName
      password
      sshPrivateKey
      isRemoved
      createdAt
      updatedAt
      lastSyncedAt
    }
  }
`;

export const UPDATE_MY_HUB = `
  mutation updateChaosHub($request: UpdateChaosHubRequest!) {
    updateChaosHub(request: $request) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const SYNC_REPO = `
  mutation syncChaosHub($id: ID!, $projectID: String!) {
    syncChaosHub(id: $id, projectID: $projectID) {
      id
      repoURL
      repoBranch
      isAvailable
      totalExp
      hubName
    }
  }
`;

export const DELETE_HUB = `
  mutation deleteChaosHub($hubID: String!, $projectID: String!) {
    deleteChaosHub(hubID: $hubID, projectID: $projectID)
  }
`;

export const GENERATE_SSH = `
  mutation generateSSHKey {
    generaterSSHKey {
      privateKey
      publicKey
    }
  }
`;
