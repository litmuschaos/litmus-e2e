#!/bin/bash

source litmus/utils.sh

path=$(pwd)

version=${PORTAL_VERSION}

kubectl delete workflows --all -A
kubectl delete cronworkflows --all -A
kubectl delete chaosengines --all -A
kubectl delete chaosresult --all -A

# Shutting down the Litmus-Portal Setup
curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml --output litmus-portal-cleanup.yml

manifest_image_update $version litmus-portal-cleanup.yml

kubectl delete -f litmus-portal-cleanup.yml
