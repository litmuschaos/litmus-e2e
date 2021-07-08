#!/bin/bash

source litmus/utils.sh

# path=$(pwd)
version=${PORTAL_VERSION}
loadBalancer=${LOAD_BALANCER}

echo -e "\n---------------Installing Litmus-Portal using Manifest----------\n"
curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml --output litmus-portal-setup.yml
manifest_image_update $version litmus-portal-setup.yml

kubectl apply -f litmus-portal-setup.yml

echo -e "\n---------------Pods running in Litmus Namespace---------------\n"
kubectl get pods -n litmus

echo -e "\n---------------Waiting for all pods to be ready---------------\n"
# Waiting for pods to be ready (timeout - 360s)
wait_for_pods litmus 360

echo -e "\n------------- Verifying Namespace, Deployments, pods and Images for Litmus-Portal ------------------\n"
# Namespace verification
verify_namespace litmus

# Deployments verification
verify_all_components litmusportal-frontend,litmusportal-server litmus

# Pods verification
verify_pod litmusportal-frontend litmus
verify_pod litmusportal-server litmus
verify_pod mongo litmus

# Images verification
verify_deployment_image $version litmusportal-frontend litmus
verify_deployment_image $version litmusportal-server litmus

if [[ "$loadBalancer" == "true" ]];then
    kubectl patch svc litmusportal-server-service -p '{"spec": {"type": "LoadBalancer"}}' -n litmus
    wait_for_loadbalancer litmusportal-frontend-service litmus
    echo "Backend LoadBalancer service is active now"

fi

export NODE_NAME=$(kubectl -n litmus get pod  -l "component=litmusportal-frontend" -o=jsonpath='{.items[*].spec.nodeName}')
export NODE_IP=$(kubectl -n litmus get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}')
export NODE_PORT=$(kubectl -n litmus get -o jsonpath="{.spec.ports[0].nodePort}" services litmusportal-frontend-service)
export AccessURL="http://$NODE_IP:$NODE_PORT"
echo "URL=$AccessURL" >> $GITHUB_ENV

