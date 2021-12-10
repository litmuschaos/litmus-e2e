#!/bin/bash

echo "#############################################################"
echo "############ Getting Node Status ################"
echo "#############################################################"
echo 
echo "kubectl get nodes"
kubectl get nodes || true

echo "#############################################################"
echo "############ Getting pods in Chaos Namespace ################"
echo "#############################################################"
echo 
echo "kubectl get pods -n ${CHAOS_NAMESPACE}"
kubectl get pods -n ${CHAOS_NAMESPACE} || true
echo
echo "###################################################################"
echo "############ Getting pods in Application Namespace ################"
echo "###################################################################"
echo
echo "kubectl get pods -n ${APP_NS}"
kubectl get pods -n ${APP_NS} || true
echo
echo "################################################################"
echo "############ Getting Chaos Resource Information ################"
echo "################################################################"
echo
echo "kubectl get chaosengine,chaosexperiment,chaosresult -n ${CHAOS_NAMESPACE}"
kubectl get chaosengine,chaosexperiment,chaosresult -n ${CHAOS_NAMESPACE} || true
echo
echo "################################################################"
echo "############ Getting Service Account Information ################"
echo "################################################################"
echo
echo "kubectl get sa -n ${CHAOS_NAMESPACE}"
kubectl get sa -n ${CHAOS_NAMESPACE} || true
echo
echo "###################################################"
echo "############ Describe ChaosEngine  ################"
echo "###################################################"
echo
echo "kubectl describe chaosengine -n ${CHAOS_NAMESPACE}"
kubectl describe chaosengine -n ${CHAOS_NAMESPACE} || true
echo
echo "###################################################"
echo "############ Describe ChaosResult  ################"
echo "###################################################"
echo
echo "kubectl describe chaosresult -n ${CHAOS_NAMESPACE}"
kubectl describe chaosresult -n ${CHAOS_NAMESPACE} || true
echo
echo "###################################################"
echo "############ Describe ChaosExperiment  ################"
echo "###################################################"
echo
echo "kubectl describe chaosexperiment -n ${CHAOS_NAMESPACE}"
kubectl describe chaosexperiment -n ${CHAOS_NAMESPACE} || true
echo
