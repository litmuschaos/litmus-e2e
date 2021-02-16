#!/bin/bash
set -ex
path=$(pwd)

# # Setting up the kubeconfig
mkdir -p ~/.kube

cp $path/.kube/config ~/.kube/config
cp $path/.kube/admin.conf ~/.kube/config

echo "----------------Installing Litmus-Portal----------------------"
# Booting up the Litmus-Portal Setup
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/cluster-k8s-manifest.yml

echo "-----------Pods Running in Litmus Namespace------------"
kubectl get pods -n litmus

echo "---------Services Running in Litmus Namespace----------"
kubectl get svc -n litmus

# Waiting for pods to be ready
kubectl wait --for=condition=Ready pods --all --namespace litmus --timeout=180s

# Getting The LoadBalancer IP for accessing Litmus-Portal
kubectl patch svc litmusportal-frontend-service -p '{"spec": {"type": "LoadBalancer"}}' -n litmus

IP="";
# Waiting for LoadBalancer assignment for svc 
while [ -z $IP ]; 
do echo "Waiting for end point..."; 
IP=$(kubectl get svc litmusportal-frontend-service -n litmus --template="{{range .status.loadBalancer.ingress}}{{.hostname}}{{end}}"); 
[ -z "$IP" ] && sleep 10; 
done; 

URL=http://$IP:9091

# Waiting for URL to be active
until $(curl --output /dev/null --silent --head --fail $URL); do
    printf '.'
    sleep 5
done

echo "URL to access Litmus-Portal: $URL"

#Storing URL as env variable
echo "URL=$URL" > url.txt