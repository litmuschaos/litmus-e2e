export const addProbe = `
    mutation addKubernetesHTTPProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
        name
        description
        type
        kubernetesHTTPProperties {
            probeTimeout
            interval
            url
            insecureSkipVerify
        }
    }
}`

export const updateProbe = `
    mutation updateProbe($request: ProbeRequest!, $projectID: ID!) {
        updateProbe(request: $request, projectID: $projectID)
}`

export const deleteprobe = `
    mutation deleteProbe($probeName: ID!, $projectID: ID!) {
        deleteProbe(probeName: $probeName, projectID: $projectID)
}`