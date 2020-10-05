#!/bin/bash

# Booting up the Litmus-Portal Setup
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/k8s-manifest.yml
# kubectl patch svc litmusportal-frontend-service -p '{"spec": {"type": "LoadBalancer"}}' -n litmus
kubectl wait --for=condition=Ready pods --all --namespace litmus --timeout=180s

## For NodePort (Should be removed if not working)
export NODE_NAME=$(kubectl get pod -n litmus -l "component=litmusportal-frontend" -o=jsonpath='{.items[*].spec.nodeName}')
# export EXTERNAL_IP=$(kubectl get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="ExternalIP")].address}')
export NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services litmusportal-frontend-service -n litmus)
# echo "URL: http://$EXTERNAL_IP:$NODE_PORT"


# Trying to access portal using Node_IP and Node_Port
external_ip="";
while [ -z $external_ip ];
do echo "Waiting for Node_IP...";
external_ip=$(kubectl get nodes $NODE_NAME -o jsonpath='{.status.addresses[?(@.type=="ExternalIP")].address}');
[ -z "$external_ip" ] && sleep 10;
done;
echo "End point is ready-" && echo $external_ip;

echo "FRONTEND_IP=$external_ip" >> Portal-Setup.env

echo "URL: http://$external_ip:$NODE_PORT"

echo "Pods Running in Litmus Namespace"
kubectl get pods -n litmus

echo "Services Running in Litmus Namespace"
kubectl get svc -n litmus


# Trying to access portal using LoadBalancer

# external_ip=""; 
# while [ -z $external_ip ]; 
# do echo "Waiting for end point..."; 
# external_ip=$(kubectl get svc litmusportal-frontend-service -n litmus --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}"); 
# [ -z "$external_ip" ] && sleep 10; 
# done; 
# echo "End point is ready-" && echo $external_ip; 

# Caching the External_IP of loadBalancer in Environment Variable for Testing
# echo "FRONTEND_IP=$external_ip" >> Portal-Setup.env
