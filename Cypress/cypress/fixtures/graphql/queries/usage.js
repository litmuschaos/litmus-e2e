export const GET_GLOBAL_STATS = `
  query getGlobalStats($request: UsageDataRequest!) {
    getUsageData(request: $request) {
      totalCount {
        projects
        users
        agents {
          ns
          cluster
          total
        }
        workflows {
          schedules
          runs
          expRuns
        }
      }
    }
  }
`;

// projectId -> projectID needs to be updated in backend
export const GLOBAL_PROJECT_DATA = `
  query getStats($request: UsageDataRequest!) {
    getUsageData(request: $request) {
      totalCount {
        projects
      }
      projects {
        projectId
        workflows {
          schedules
          runs
          expRuns
        }
        agents {
          ns
          cluster
          total
        }
      }
    }
  }
`;
