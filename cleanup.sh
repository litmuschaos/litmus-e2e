#!/bin/bash
set -e


echo "Cleaning up all go experiment and engine from all namespace"

kubectl delete chaosexperiment,chaosengine --all --all-namespaces
