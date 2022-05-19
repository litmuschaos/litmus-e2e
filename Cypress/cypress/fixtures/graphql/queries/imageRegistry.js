export const LIST_IMAGE_REGISTRY_BY_PROJECT_ID = `
  query listImageRegistry($data: String!) {
    listImageRegistry(projectID: $data) {
      imageRegistryInfo {
        enableRegistry
        isDefault
      }
      imageRegistryID
    }
  }
`;

export const GET_IMAGE_REGISTRY = `
  query getImageRegistry($imageRegistryID: String!, $projectID: String!) {
    getImageRegistry(imageRegistryID: $imageRegistryID, projectID: $projectID) {
      imageRegistryInfo {
        isDefault
        enableRegistry
        secretName
        secretNamespace
        imageRegistryName
        imageRepoName
        imageRegistryType
      }
      imageRegistryID
    }
  }
`;
