#!/bin/bash

source litmus/utils.sh
# source utils.sh

path=$(pwd)
version=${PORTAL_VERSION}
loadBalancer=${LOAD_BALANCER}
LITMUS_PORTAL_NAMESPACE=${PORTAL_NAMESPACE}

kubectl create ns ${LITMUS_PORTAL_NAMESPACE}
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml
curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/namespaced-k8s-template.yml --output litmus-portal-namespaced-k8s-template.yml

# Manifest Manipulation
envsubst < litmus-portal-namespaced-k8s-template.yml > ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml
manifest_image_update $version ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml

cat ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml

# Applying the manifest
kubectl apply -f ${LITMUS_PORTAL_NAMESPACE}-ns-scoped-litmus-portal-manifest.yml -n ${LITMUS_PORTAL_NAMESPACE}

# TODO: To be Removed
kubectl get pods -n ${LITMUS_PORTAL_NAMESPACE}

echo "-------- Waiting for all pods to be ready-----------"
# Waiting for pods to be ready (timeout - 180s)
wait_for_pods ${LITMUS_PORTAL_NAMESPACE} 360

echo "------------- Verifying Namespace, Deployments, pods and Images for Litmus-Portal ------------------"
# Namespace verification
verify_namespace ${LITMUS_PORTAL_NAMESPACE}

# Deployments verification
verify_deployment litmusportal-frontend ${LITMUS_PORTAL_NAMESPACE}
verify_deployment litmusportal-server ${LITMUS_PORTAL_NAMESPACE}

# Pods verification
verify_pod litmusportal-frontend ${LITMUS_PORTAL_NAMESPACE}
verify_pod litmusportal-server ${LITMUS_PORTAL_NAMESPACE}

# Images verification
verify_deployment_image $version litmusportal-frontend ${LITMUS_PORTAL_NAMESPACE}
verify_deployment_image $version litmusportal-server ${LITMUS_PORTAL_NAMESPACE}


# Backend-Server-service using LoadBalancer
#**
if [[ "$loadBalancer" == "true" ]];then
    kubectl patch svc litmusportal-server-service -p '{"spec": {"type": "LoadBalancer"}}' -n ${LITMUS_PORTAL_NAMESPACE}

    wait_for_loadbalancer litmusportal-frontend-service ${LITMUS_PORTAL_NAMESPACE}
    echo "Backend LoadBalancer service is active now"
fi
    
export NODE_NAME=$(kubectl -n ${LITMUS_PORTAL_NAMESPACE} get pod  -l "component=litmusportal-frontend" -o=jsonpath='{.items[*].spec.nodeName}')
export NODE_IP=$(kubectl -n ${LITMUS_PORTAL_NAMESPACE} get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}')
export NODE_PORT=$(kubectl -n ${LITMUS_PORTAL_NAMESPACE} get -o jsonpath="{.spec.ports[0].nodePort}" services litmusportal-frontend-service)
export AccessURL="http://$NODE_IP:$NODE_PORT"
echo "URL=$AccessURL" >> $GITHUB_ENV

