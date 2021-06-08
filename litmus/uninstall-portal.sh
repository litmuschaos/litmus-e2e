#!/bin/bash

source litmus/utils.sh

path=$(pwd)

version=${PORTAL_VERSION}

# Setting up the kubeconfig
# mkdir -p ~/.kube

# cp $path/.kube/config ~/.kube/config
# cp $path/.kube/admin.conf ~/.kube/config

# Shutting down the Litmus-Portal Setup
curl https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml --output litmus-portal-cleanup.yml

manifest_image_update $version litmus-portal-cleanup.yml

kubectl delete -f litmus-portal-cleanup.yml
