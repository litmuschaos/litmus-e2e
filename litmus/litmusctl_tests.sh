#!/bin/bash

# All intermediate functions are defined in utils.sh
source litmus/utils.sh

namespace=${AGENT_NAMESPACE}
installation_mode=${INSTALLATION_MODE}
accessPoint=${ACCESS_URL}
agentName=${AGENT_NAME}
projectName=${PROJECT_NAME}

components=subscriber,chaos-exporter,chaos-operator-ce,event-tracker,workflow-controller
defaultTolerations='[{"tolerationSeconds":0,"key":"special","value":"true","Operator":"Equal","effect":"NoSchedule"}]'
defaultNodeSelectors='beta.kubernetes.io/arch=amd64'


# Custom functions for running litmusctl commands -------------------------------------------------------------------

function configure_account(){
    litmusctl config set-account --endpoint="${accessPoint}" --username="admin" --password="litmus"
}

function agent_cleanup(){
    echo -e "\n Cleaning up created agent\n"
    kubectl delete ns $namespace
    kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml
}

function configure_agent(){

    nodeSelectors=$1

    tolerations=$2

    projectID=$(litmusctl get projects | grep "${projectName}" |  awk '{print $1}')

    if [[ "$installation_mode" == "NS-MODE" ]];then

        kubectl create ns ${namespace}
        # Installing CRD's, required for namespaced mode
        kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/litmus-portal/litmus-portal-crds.yml
        
        litmusctl create agent --agent-name=${agentName} --project-id=${projectID} --installation-mode=namespace --namespace=${namespace} --node-selector=${nodeSelectors} --tolerations=${tolerations} --non-interactive

    else
            
        litmusctl create agent --agent-name=${agentName} --project-id=${projectID} --installation-mode=cluster --namespace=${namespace} --node-selector=${nodeSelectors} --tolerations=${tolerations} --non-interactive
    
    fi

    wait_for_agent_to_be_ready      
}

function wait_for_agent_to_be_ready(){

    echo -e "\n---------------Pods running in ${namespace} Namespace---------------\n"
    kubectl get pods -n ${namespace}

    echo -e "\n---------------Waiting for all pods to be ready---------------\n"
    # Waiting for pods to be ready (timeout - 360s)
    wait_for_pods ${namespace} 360

    # Deployments verification
    verify_all_components $components ${namespace}
}

# functions for running tests for litmusctl -------------------------------------------------------------------

function test_install_with_nodeSelectors() {
    configure_account

    configure_agent $defaultNodeSelectors ""
    
    echo "Verifying nodeSelectors in all required Deployments"

    for i in $(echo $components | sed "s/,/ /g")
    do
        verify_deployment_nodeselector ${i} ${namespace} '{"beta.kubernetes.io/arch":"amd64"}'
    done

    agent_cleanup
}

function test_install_with_tolerations() {
    configure_account

    configure_agent "" $defaultTolerations

    echo "Verifying tolerations in all required Deployments"

    for i in $(echo $components | sed "s/,/ /g")
    do
        verify_deployment_tolerations ${i} ${namespace} '[{"effect":"NoSchedule","key":"special","operator":"Equal","value":"true"}]' 
    done

    agent_cleanup
}

function test_native() {
    configure_account

    configure_agent "" ""

    agent_cleanup
}

function test_get_projects(){
    configure_account

    projects=$(litmusctl get projects | wc -l)

    if [[ ${projects} -gt 1 ]];then
        echo -e "\n[Info]: litmusctl get projects working fine ✓\n"
    else 
        echo -e "\n[Error]: litmusctl get projects not working as expected\n"
        exit 1
    fi
}

function test_get_agents(){
    configure_account

    projectID=$(litmusctl get projects | grep "${projectName}" |  awk '{print $1}')

    noOfProjects=$(litmusctl get agents --project-id=$projectID | wc -l)

    if [[ ${noOfProjects} -gt 1 ]];then
        echo -e "\n[Info]: litmusctl get agents working fine ✓\n"
    else 
        echo -e "\n[Error]: litmusctl get agents not working as expected\n"
        exit 1
    fi

}

case ${1} in
  test_with_nodeSelectors)
    test_install_with_nodeSelectors
    ;;
  test_with_tolerations)
    test_install_with_tolerations
    ;;
  test_native)
    test_native
    ;;
  test_get_projects)
    test_get_projects
    ;;
  test_get_agents)
    test_get_agents
    ;;
  *)
    echo "Invalid Arguments"
    exit 1
esac