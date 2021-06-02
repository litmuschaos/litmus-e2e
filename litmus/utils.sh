#!/bin/bash

## Function to wait for a Given Endpoint to be active
function wait_for_url(){
    wait_period=0
    URL=$1
    # Waiting for URL to be active
    until $(curl --output /dev/null --silent --head --fail $URL); do
    wait_period=$(($wait_period+10))
    if [ $wait_period -gt 300 ];then
       echo "The frontend URL couldn't come in active state in 5 minutes, exiting now.."
       exit 1
    else
       printf '.'
       sleep 5
    fi
done
}

## Function to wait for loadbalancer to assigned to a service in a given namespace
function wait_for_loadbalancer(){
    # Variable to store LoadBalancer IP
    IP="";
    Namespace=$2
    SVC=$1
    # Variable to store waiting time for getting IP
    wait_period=0

    # Waiting for LoadBalancer assignment for svc 
    while [ -z $IP ]; 
    do
    wait_period=$(($wait_period+10))
        if [ $wait_period -gt 300 ];then
        echo "Couldn't get LoadBalancer IP in 5 minutes, exiting now.."
        exit 1
        else
        echo "Waiting for end point..."; 
        IP=$(kubectl get svc $SVC -n $Namespace --template="{{range .status.loadBalancer.ingress}}{{.hostname}}{{end}}"); 
        [ -z "$IP" ] && sleep 10; 
        fi
    done; 
}

## Function to list requested resources in given namespaces
function show_resources(){
    resource_type=$1
    namespace=$2
    kubectl get $resource_type -n $namespace
}

## Function to wait for all pods to be active in a given namespace for given timeout
function wait_for_pods(){
    namespace=$1
    timeout="$2s" # Added "s" for seconds
    kubectl wait --for=condition=Ready pods --all --namespace litmus --timeout=360s
}

## Function for verifying deployment
function verify_deployment(){
    deployment=$1
    namespace=$2
    DEPLOYMENT=$(eval "kubectl get deployments -n ${namespace} | awk '/${deployment}/'")
    if [[ -z "$DEPLOYMENT" ]];then
        echo "$deployment deployment not found in $namespace namespace"
        exit 1
    else
        echo "$deployment deployment found in $namespace namespace"
    fi
}

## Function for verifying pod in a given namespace
function verify_pod(){
    pod=$1
    namespace=$2
    POD=$(eval "kubectl get pods -n ${namespace} | awk '/${pod}/'")
    if [[ -z "$POD" ]];then
        echo "$pod pod not found in $namespace namespace"
        exit 1
    else
        echo "$pod pod found in $namespace namespace"
    fi
}

## Function to verify namespace
function verify_namespace(){
    namespace=$1
    NS=$(eval "kubectl get ns | awk '/${namespace}/'")
    if [[ -z "$NS" ]];then
        echo "$namespace Namespace not found"
        exit 1
    else
        echo "$namespace namespace found"
    fi 
}

## Function to update images in portal manifests, Currently specific to Portal Only
function manifest_image_update(){
    version=$1
    manifest_name=$2
    sed -i -e "s|litmuschaos/litmusportal-frontend:ci|litmuschaos/litmusportal-frontend:$version|g" $manifest_name
    sed -i -e "s|litmuschaos/litmusportal-server:ci|litmuschaos/litmusportal-server:$version|g" $manifest_name
    sed -i -e "s|litmuschaos/litmusportal-auth-server:ci|litmuschaos/litmusportal-auth-server:$version|g" $manifest_name
    sed -i -e "s|litmuschaos/litmusportal-subscriber:ci|litmuschaos/litmusportal-subscriber:$version|g" $manifest_name
    sed -i -e "s|litmuschaos/litmusportal-event-tracker:ci|litmuschaos/litmusportal-event-tracker:$version|g" $manifest_name
}

## Function to verify image for a deployment in given namespace
function verify_deployment_image(){
    image=$1
    deployment=$2
    namespace=$3
    IMAGE=$(eval "kubectl get deployment ${deployement} -n ${namespace} -o=jsonpath='{$.spec.template.spec.containers[:1].image}'")
    if [[ "$image" == "$IMAGE" ]];then
        echo "$deployment deployment is not having the image ${image}"
        exit 1
    else 
        echo "$deployment deployment with image ${image} verified"
    fi
}