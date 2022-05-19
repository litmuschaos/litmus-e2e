export const GET_IMAGE_REGISTRY = `
  query getImageRegistry($imageRegistryID: String!, $projectID: String!){
    getImageRegistry(imageRegistryID: $imageRegistryID, projectID: $projectID){
      isDefault
      imageRegistryID
      projectID
      updatedAt
      createdAt
      isRemoved
    }
  }
`;
