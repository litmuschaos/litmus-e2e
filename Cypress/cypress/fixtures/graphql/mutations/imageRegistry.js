export const ADD_IMAGE_REGISTRY = `
  mutation createImageRegistry(
    $projectID: String!
    $imageRegistryInfo: imageRegistryInput!
  ) {
    createImageRegistry(
      projectID: $projectID
      imageRegistryInfo: $imageRegistryInfo
    ) {
      imageRegistryInfo {
        imageRepoName
        imageRegistryName
        imageRegistryType
        isDefault
      }
    }
  }
`;

export const UPDATE_IMAGE_REGISTRY = `
  mutation updateImageRegistry(
    $imageRegistryID: String!
    $projectID: String!
    $imageRegistryInfo: ImageRegistryInput!
  ) {
    updateImageRegistry(
      imageRegistryID: $imageRegistryID
      projectID: $projectID
      imageRegistryInfo: $imageRegistryInfo
    ) {
      imageRegistryInfo {
        imageRepoName
        imageRegistryName
        imageRegistryType
        isDefault
      }
    }
  }
`;
