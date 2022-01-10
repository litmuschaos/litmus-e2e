export const addMyHub = `mutation addMyHub($myhubInput: CreateMyHub!, $projectID: String!){
  addMyHub(myhubInput: $myhubInput, projectID: $projectID){
    id
    RepoURL
    RepoBranch
    ProjectID
    HubName
    IsPrivate
    AuthType
    Token
    UserName
    Password
    SSHPrivateKey
    IsRemoved
    CreatedAt
    UpdatedAt
    LastSyncedAt
  }
}`;

export const updateMyHub = `mutation updateMyHub($myhubInput: UpdateMyHub!, $projectID: String!){
  updateMyHub(myhubInput: $myhubInput, projectID: $projectID){
    id
    RepoURL
    RepoBranch
    ProjectID
    HubName
    IsPrivate
    AuthType
    Token
    UserName
    Password
    SSHPrivateKey
    IsRemoved
    CreatedAt
    UpdatedAt
    LastSyncedAt
  }
}`;

export const deleteMyHub = `mutation deleteMyHub($hub_id: String!){
  deleteMyHub(hub_id: $hub_id)
}`;