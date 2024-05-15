export const add_httpProbe = `
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

export const update_httpProbe = `
    mutation updateProbe($request: ProbeRequest!, $projectID: ID!) {
        updateProbe(request: $request, projectID: $projectID)
}`

export const delete_httpprobe = `
    mutation deleteProbe($probeName: ID!, $projectID: ID!) {
        deleteProbe(probeName: $probeName, projectID: $projectID)
}`


export const add_CMDProbe = `
    mutation addKubernetesCMDProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
            name
            description
            type
            kubernetesCMDProperties {
                probeTimeout
                interval
                command
                comparator {
                    type
                    value
                }
            }
        }
}`

export const update_CMDProbe = `
    mutation updateProbe($request: ProbeRequest!, $projectID: ID!) {
        updateProbe(request: $request, projectID: $projectID)
}`

export const delete_CMDprobe = `
    mutation deleteProbe($probeName: ID!, $projectID: ID!) {
        deleteProbe(probeName: $probeName, projectID: $projectID)
}`


export const add_PROMProbe = `
    mutation addPROMProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
            name
            description
            type
            promProperties {
                probeTimeout
                interval
                retry
                comparator {
                    type
                    value
                }
            }
        }
}`

export const update_PROMProbe = `
    mutation updateProbe($request: ProbeRequest!, $projectID: ID!) {
        updateProbe(request: $request, projectID: $projectID)
}`

export const delete_PROMProbe = `
    mutation deleteProbe($probeName: ID!, $projectID: ID!) {
        deleteProbe(probeName: $probeName, projectID: $projectID)
}`


export const add_k8sProbe = `
    mutation addK8SProbe($projectID: ID!, $request: ProbeRequest!) {
        addProbe(projectID: $projectID, request: $request) {
            name
            description
            type
            k8sProperties {
                probeTimeout
                interval
                retry
                group
                version
                resource
                namespace
            }
        }
}`

export const update_k8sProbe = `
    mutation updateProbe($request: ProbeRequest!, $projectID: ID!) {
        updateProbe(request: $request, projectID: $projectID)
}`

export const delete_k8sProbe = `
    mutation deleteProbe($probeName: ID!, $projectID: ID!) {
        deleteProbe(probeName: $probeName, projectID: $projectID)
}`