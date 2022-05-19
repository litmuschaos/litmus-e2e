export const REGISTER_CLUSTER = `mutation registerCluster($request: RegisterClusterRequest!){
  registerCluster(request: $request){
    token
    clusterID
    clusterName
  }
}`;

export const DELETE_CLUSTER = `mutation deleteClusters($projectID: String!, $clusterIDs: [String]!){
  deleteClusters(projectID: $projectID, clusterIDs: $clusterIDs)
}`;
