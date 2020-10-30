#!/bin/bash
set -e 

echo "----------------Installing Portal----------------------"
# Booting up the Litmus-Portal Setup
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml

echo "-----------Pods Running in Litmus Namespace------------"
kubectl get pods -n litmus

echo "---------Services Running in Litmus Namespace----------"
kubectl get svc -n litmus

# Patching the frontend-service to use the Default port
kubectl patch svc litmusportal-frontend-service -n litmus -p '{"spec": {"ports": [{"port": 9091,"targetPort": 80,"name": "http","nodePort":30221}],"type": "NodePort"}}'

echo "---------Services Running in Litmus Namespace----------"
kubectl get svc -n litmus

# Waiting for pods to be ready
kubectl wait --for=condition=Ready pods --all --namespace litmus --timeout=120s