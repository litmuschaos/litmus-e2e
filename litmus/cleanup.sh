#!/bin/bash
set -ex
path=$(pwd)

# # Setting up the kubeconfig
mkdir -p ~/.kube

cp $path/.kube/config ~/.kube/config
cp $path/.kube/admin.conf ~/.kube/config

# Shutting down the Litmus-Portal Setup
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml
