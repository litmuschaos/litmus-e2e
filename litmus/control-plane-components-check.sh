#!/bin/bash

source litmus/utils.sh
PORTAL_NAMESPACE=${LITMUS_PORTAL_NAMESPACE}

echo "Verifying all required Deployments"
verify_deployment litmusportal-frontend ${PORTAL_NAMESPACE}
verify_deployment litmusportal-server ${PORTAL_NAMESPACE}
verify_deployment chaos-operator-ce  ${PORTAL_NAMESPACE}
verify_deployment event-tracker ${PORTAL_NAMESPACE}
verify_deployment subscriber ${PORTAL_NAMESPACE}
verify_deployment workflow-controller ${PORTAL_NAMESPACE}
verify_deployment argo-server ${PORTAL_NAMESPACE}

echo "Verifying all required Pods"
verify_pod litmusportal-frontend ${PORTAL_NAMESPACE}
verify_pod litmusportal-server ${PORTAL_NAMESPACE}
verify_pod mongo ${PORTAL_NAMESPACE}
verify_pod chaos-operator-ce ${PORTAL_NAMESPACE}
verify_pod event-tracker ${PORTAL_NAMESPACE}
verify_pod subscriber ${PORTAL_NAMESPACE}
verify_pod workflow-controller ${PORTAL_NAMESPACE}
verify_pod argo-server ${PORTAL_NAMESPACE}

echo "Waiting for all pods to be ready"
wait_for_pods ${PORTAL_NAMESPACE} 360
