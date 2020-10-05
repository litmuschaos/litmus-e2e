#!/bin/bash

# Shutting down the Litmus-Portal Setup
kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/k8s-manifest.yml
