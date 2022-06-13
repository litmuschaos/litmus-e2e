#!/bin/bash

source litmus/utils.sh

path=$(pwd)

version=${PORTAL_VERSION}
namespace=${PORTAL_NAMESPACE}

kubectl delete workflows --all -A
kubectl delete cronworkflows --all -A
kubectl delete chaosengines --all -A
kubectl delete chaosresult --all -A

# Shutting down the Litmus-Portal Setup
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/namespace-k8s-manifest.yml -n ${namespace}

