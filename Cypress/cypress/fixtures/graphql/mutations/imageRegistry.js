export const ADD_IMAGE_REGISTRY = `
  mutation createImageRegistry($projectID: String!, $imageRegistryInfo: ImageRegistryInput!){
    createImageRegistry(projectID: $projectID, imageRegistryInfo: $imageRegistryInfo){
      isDefault
      imageRegistryID
      projectID
      updatedAt
      createdAt
      isRemoved
    }
  }
`;

export const UPDATE_IMAGE_REGISTRY = `
  mutation updateImageRegistry($imageRegistryID: String!, $projectID: String!, $imageRegistryInfo: ImageRegistryInput!){
    updateImageRegistry(imageRegistryID: $imageRegistryID, projectID: $projectID, imageRegistryInfo: $imageRegistryInfo){
      isDefault
      imageRegistryID
      projectID
      updatedAt
      createdAt
      isRemoved
    }
  }
`;

export const DELETE_IMAGE_REGISTRY = `
  mutation deleteImageRegistry($imageRegistryID: String!, $projectID: String!){
    deleteImageRegistry(imageRegistryID: $imageRegistryID, projectID: $projectID)
  }
`;
