#!/bin/bash

# All intermediate functions are defined in utils.sh
source litmus/utils.sh

version=${PORTAL_VERSION}
accessType=${ACCESS_TYPE}
namespace=${NAMESPACE}
installation_mode=${INSTALLATION_MODE}


function install_portal_cs_mode() {

    echo -e "\n---------------Installing Litmus-Portal in Cluster Scope----------\n"
    curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml --output litmus-portal-setup.yml
    manifest_image_update $version litmus-portal-setup.yml

    kubectl apply -f litmus-portal-setup.yml
}

function install_portal_ns_mode(){

    echo -e "\n---------------Installing Litmus-Portal in Namespace Scope----------\n"
    kubectl create ns ${namespace}
    # Installing CRD's, required for namespaced mode
    kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml

    # Exporting namespace variable to update `namespaced-k8s-template.yml` manifest
    export LITMUS_PORTAL_NAMESPACE=${namespace}
    # Downloading manifest for namespaced mode installation
    curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/namespaced-k8s-template.yml --output litmus-portal-namespaced-k8s-template.yml

    # Replacing ${LITMUS_PORTAL_NAMESPACE}
    envsubst '${LITMUS_PORTAL_NAMESPACE}' < litmus-portal-namespaced-k8s-template.yml > ${namespace}-ns-scoped-litmus-portal-manifest.yml
    manifest_image_update $version ${namespace}-ns-scoped-litmus-portal-manifest.yml

    cat ${namespace}-ns-scoped-litmus-portal-manifest.yml

    # Applying the manifest
    kubectl apply -f ${namespace}-ns-scoped-litmus-portal-manifest.yml -n ${namespace}
}


function wait_for_portal_to_be_ready(){

    echo -e "\n---------------Pods running in ${namespace} Namespace---------------\n"
    kubectl get pods -n ${namespace}

    echo -e "\n---------------Waiting for all pods to be ready---------------\n"
    # Waiting for pods to be ready (timeout - 360s)
    wait_for_pods ${namespace} 360

    echo -e "\n------------- Verifying Namespace, Deployments, pods and Images for Litmus-Portal ------------------\n"
    # Namespace verification
    verify_namespace ${namespace}

    # Deployments verification
    verify_all_components litmusportal-frontend,litmusportal-server ${namespace}

    # Pods verification
    verify_pod litmusportal-frontend ${namespace}
    verify_pod litmusportal-server ${namespace}
    verify_pod mongo ${namespace}

    # Images verification
    verify_deployment_image $version litmusportal-frontend ${namespace}
    verify_deployment_image $version litmusportal-server ${namespace}
}

if [[ "$installation_mode" == "CS-MODE" ]];then
    install_portal_cs_mode
elif [[ "$installation_mode" == "NS-MODE" ]];then
    install_portal_ns_mode
else
    echo "Selected Mode Not Found"
    exit 1
fi

wait_for_portal_to_be_ready
get_access_point ${namespace} ${accessType}