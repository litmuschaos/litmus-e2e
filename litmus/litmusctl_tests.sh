#!/bin/bash

set -o pipefail

# All intermediate functions are defined in utils.sh
source litmus/utils.sh

namespace=${AGENT_NAMESPACE}
# namespace='shivamtestnamespace'
installation_mode=${INSTALLATION_MODE}
# installation_mode='NS-MODE'
accessPoint=${ACCESS_URL}
# accessPoint='http://192.168.49.2:30186'
infraName=${AGENT_NAME}
# infraName='infratest'
projectName=${PROJECT_NAME}
# projectName='my new project'
envName="testenv1"
envName=${ENVIRONMENT_NAME}
# experiment name should be same as defined in the yaml
expName=${EXPERIMENT_NAME} 
probeName=${PROBE_NAME}

components="subscriber,chaos-exporter,chaos-operator-ce,event-tracker,workflow-controller"
# defaultTolerations='[{"tolerationSeconds":0,"key":"special","value":"true","Operator":"Equal","effect":"NoSchedule"}]'
defaultTolerations='[{"key":"special","value":"true","Operator":"Equal","effect":"NoSchedule"}]'
defaultNodeSelectors='beta.kubernetes.io/arch=amd64'


# Custom functions for running litmusctl commands -------------------------------------------------------------------

function configure_account(){
    litmusctl config set-account --endpoint="${accessPoint}" --username="admin" --password="litmus" --non-interactive=true
}

function infra_cleanup(){
    echo -e "\n Cleaning up created infra\n"
    kubectl delete ns $namespace
    kubectl delete -f https://raw.githubusercontent.com/litmuschaos/litmus/master/chaoscenter/manifests/litmus-portal-crds.yml
}

function configure_infra(){

    nodeSelectors=$1

    tolerations=$2
    echo "project name is ${projectName}"

    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    echo "projectID obtained is ${projectID}"
    
    if [[ "$installation_mode" == "NS-MODE" ]];then

        kubectl create ns ${namespace}
        echo "installation mode is ${installation_mode}"
        # Installing CRD's, required for namespaced mode
        kubectl apply -f https://raw.githubusercontent.com/litmuschaos/litmus/master/chaoscenter/manifests/litmus-portal-crds.yml
        
        litmusctl connect chaos-infra --name=${infraName} --project-id=${projectID} --environment-id=${envName} --installation-mode=namespace --namespace=${namespace} --node-selector=${nodeSelectors} --tolerations=${tolerations} --non-interactive

    else
        litmusctl connect chaos-infra --name=${infraName} --project-id=${projectID} --environment-id=${envName} --installation-mode=cluster --namespace=${namespace} --node-selector=${nodeSelectors} --tolerations=${tolerations} --non-interactive
    
    fi

    wait_for_infra_to_be_ready      
}

function disconnect_infra(){
    chaos_infra_name=$1
    project_id=$2
    chaos_infra_id=$(litmusctl get chaos-infra --project-id=$projectID | grep "${chaos_infra_name}" | awk '{print $1}')
    
    litmusctl disconnect chaos-infra ${chaos_infra_id} --project-id=${project_id}
}

function wait_for_infra_to_be_ready(){

    echo -e "\n---------------Pods running in ${namespace} Namespace---------------\n"
    kubectl get pods -n ${namespace}

    echo -e "\n---------------Waiting for all pods to be ready---------------\n"
    # Waiting for pods to be ready (timeout - 360s)
    wait_for_pods ${namespace} 360

    # Deployments verification
    verify_all_components $components ${namespace}
}
function wait_infra_to_activate(){
    infra_name=$1
    projectID=$2
    # we will wait till 3 minutes and then fail
    wait_time=180
    echo -e "\n...waiting for the infra to activate \n"
    result=$(litmusctl get chaos-infra --project-id=${projectID} | grep ${infra_name} | awk '{print $3}')
     # Check for infrastructure readiness using a suitable condition
    while [[ "$result" != "ACTIVE" ]]; do
        echo "Waiting for infrastructure ${infra_name} to become active..."
        result=$(litmusctl get chaos-infra --project-id=${projectID} | grep ${infra_name} | awk '{print $3}')
        wait_time=$((wait_time - 5))
        if [[ $wait_time -eq 0 ]]; then
        echo -e "\n[Error]: Experiment failed to start"
        return 1
        fi
        sleep 5  # Adjust sleep duration as needed
    done

    echo "Infrastructure ${infra_name} is now active."
}
function create_environment(){
    envName=$1
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    printf "\n project id is ${projectID}"
    # create a environment
    litmusctl create chaos-environment --project-id=$projectID --name=$envName
}
function delete_environment(){
    envName=$1
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    printf "\n project id is ${projectID}"
    # create a environment
    echo "y" | litmusctl delete chaos-environment --project-id=$projectID --environment-id=$envName

}
function save_experiment(){
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')
    printf "\n projectID is ${projectID}"
    # create environment and infra to save experiment
    create_environment $envName
    configure_infra "" ""
    # get infra ID
    infraID=$( litmusctl get chaos-infra --project-id=$projectID | grep "$infraName" | awk '{print$1}')

    # wait for the infra to be activated
    wait_infra_to_activate $infraName $projectID 
    nameexperiment=$expName yq eval '.metadata.name=env(nameexperiment)' Cypress/cypress/fixtures/test.yaml -i

    litmusctl save chaos-experiment --file="Cypress/cypress/fixtures/test.yaml" --project-id=${projectID} --chaos-infra-id=$infraID --description="$expName"
}

function delete_experiment(){
    experimentID=$1
    printf "\n account created successfully"
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')
    printf "\n projectID is ${projectID}"
    echo "y" | litmusctl delete chaos-experiment $experimentID --project-id=$projectID
}


# functions for running tests for litmusctl -------------------------------------------------------------------

function test_install_with_nodeSelectors() {
    configure_account
    create_environment $envName
    configure_infra $defaultNodeSelectors ""
    
    echo "Verifying nodeSelectors in all required Deployments"

    for i in $(echo $components | sed "s/,/ /g")
    do
        verify_deployment_nodeselector ${i} ${namespace} '{"beta.kubernetes.io/arch":"amd64"}'
    done
    
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
}

function test_install_with_tolerations() {
    configure_account
    create_environment $envName
    configure_infra "" $defaultTolerations

    echo "Verifying tolerations in all required Deployments"

    for i in $(echo $components | sed "s/,/ /g")
    do
        verify_deployment_tolerations ${i} ${namespace} '[{"effect":"NoSchedule","key":"special","operator":"Equal","value":"true"}]' 
    done
    
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
}

function test_native() {
    configure_account
    create_environment $envName
    configure_infra "" ""
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
}

function test_get_projects(){
    configure_account

    projects=$( echo "q" | litmusctl get projects | wc -l)
    echo "${projects}"

    if [[ ${projects} -gt 1 ]];then
        echo -e "\n[Info]: litmusctl get projects working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl get projects not working as expected\n"
        exit 1
    fi
}

function test_get_infras(){
    configure_account
    
    create_environment $envName
    configure_infra "" ""
     
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    
    configure_infra "" ""
    # we will need to create a infra before testing for get 
    # otherwise it will fail

    noOfInfras=$(litmusctl get chaos-infra --project-id=$projectID | wc -l)
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
    if [[ ${noOfInfras} -gt 1 ]];then
        echo -e "\n[Info]: litmusctl get chaos-infra working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl get chaos-infra not working as expected\n"
        exit 1
    fi

}

function test_create_project(){
    configure_account

    litmusctl create project --name="${projectName}"

    noOfProjects=$(litmusctl get projects | wc -l)
    if [[ ${noOfProjects} -gt 2 ]];then
        echo -e "\n[Info]: litmusctl create project working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl create project not working as expected\n"
        exit 1
    fi

}

function test_disconnect_infra() {
    configure_account
    create_environment $envName
    configure_infra "" ""

    projectID=$(litmusctl get projects | grep "${projectName}" |  awk '{print $1}')

    chaos_infra_id=$(litmusctl get chaos-infra --project-id=$projectID | grep "${infraName}" | awk '{print $1}')

    disconnect_infra $chaos_infra_id $projectID

    chaos_infra_id=$(litmusctl get chaos-infra --project-id=$projectID | grep "${infraName}" | awk '{print $1}')
    
    infra_cleanup
    delete_environment $envName    
    if [[ ${chaos_infra_id} == "" ]];then
        echo -e "\n[Info]: litmusctl disconnect chaos-infra working fine ✓\n"
    else 
        echo -e "\n[Error]: litmusctl disconnect chaos-infra not working as expected\n"
        exit 1
    fi
}

function test_create_environment(){
    configure_account

    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    # create a environment
    litmusctl create chaos-environment --project-id=$projectID --name=$envName
    noOfEnvs=$(echo "q" | litmusctl get chaos-environments --project-id=$projectID | wc -l)
        
    if [[ ${noOfEnvs} -gt 1 ]];then
        echo -e "\n[Info]: litmusctl create chaos-environment working fine ✓\n"
        delete_environment $envName
        exit 0

    else 
        echo -e "\n[Error]: litmusctl create chaos-environment not working as expected\n"
        exit 1
    fi

}

function test_get_environment(){
    configure_account
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    printf "\n project id is ${projectID}"

    # create the environment for testing
    create_environment $envName

    # get newly created environment
    noOfEnvs=$(echo "q" | litmusctl get chaos-environments --project-id=$projectID | wc -l)
    if [[ ${noOfEnvs} -gt 0 ]];then
        echo -e "\n[Info]: litmusctl get chaos-environment working fine ✓\n"
        delete_environment $envName
        exit 0
    else 
        echo -e "\n[Error]: litmusctl get chaos-environment not working as expected\n"
        exit 1
    fi

}

function test_delete_environment(){
    configure_account
    create_environment $envName
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    printf "\n project id is ${projectID}"

    echo "y" | litmusctl delete chaos-environment --project-id=$projectID --environment-id=$envName
    # get environment
    noOfEnvs=$(echo "q" | litmusctl get chaos-environments --project-id=$projectID | grep "${envName}" | wc -l)
    if [[ ${noOfEnvs} -lt 1 ]];then
        echo -e "\n[Info]: litmusctl delete chaos-environment working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl delete chaos-environment not working as expected\n"
        exit 1
    fi
}

function test_save_experiment(){
    configure_account
    printf "\n account created successfully"
    projectID=$(echo "q" | litmusctl get projects | grep "$projectName" | awk '{print $1}')
    printf "\n projectID is ${projectID}"
    echo "E" | sudo add-apt-repository ppa:rmescandon/yq
    sudo apt-get install yq 
    echo | echo "q" | litmusctl get chaos-experiments --project-id=$projectID --output="table"
    yq --version
    nameexperiment=$expName yq eval '.metadata.name=env(nameexperiment)' Cypress/cypress/fixtures/test.yaml -i
    # create environment and infra to save experiment
    create_environment $envName
    configure_infra "" ""
    # get infra ID
    infraID=$( litmusctl get chaos-infra --project-id=$projectID | grep "$infraName" | awk '{print$1}')

    # wait for the infra to be activated
    wait_infra_to_activate $infraName $projectID 

    # make the api call to create a http probe probe as we dont have a create  command yet
    litmusctl config view
    tokenValue=$(litmusctl config view | grep "token" | awk '{print $2}')
    endpointValue=$(litmusctl config view | grep "endpoint" | awk '{print $2}')

    curl ''"$endpointValue"'/api/query' \
    -H 'Accept-Encoding: gzip, deflate, br' \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json' \
    -H 'Connection: keep-alive' \
    -H 'DNT: 1' \
    -H 'Authorization: Bearer '"$tokenValue"' ' \
    --data-binary '{"query":"mutation createProbe($request: ProbeRequest!, $projectID: ID!) {\n\t\taddProbe(request: $request, projectID: $projectID){\n\t\t\tname\n\t\t}\n}","variables":{"projectID":"'$projectID'","request":{"name":"'$probeName'","description":"new probe for testing","type":"httpProbe","infrastructureType":"Kubernetes","tags":[],"kubernetesHTTPProperties":{"probeTimeout":"1s","interval":"1s","url":"something.com","method":{"get":{"criteria":"==","responseCode":"200"}}}}}}' \
    --compressed

    yq eval '.metadata.name'
    litmusctl save chaos-experiment --file="Cypress/cypress/fixtures/test.yaml" --project-id=${projectID} --chaos-infra-id=$infraID --description="$expName"
    
    echo | echo "q" | litmusctl get chaos-experiments --project-id=$projectID --output="table"
    
    getExperimentID=$(echo "q" | litmusctl get chaos-experiments --project-id=$projectID --output="table" | grep "$expName" | awk '{print $1}' )
    # cleanup exp and infra
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
    if [[ "$getExperimentID" = "$expName" ]];then
        echo -e "\n[Info]: litmusctl create chaos-experiment working fine ✓\n"
        delete_experiment $expName
        exit 0
    else 
        echo -e "\n[Error]: litmusctl create chaos-experiment not working as expected\n"
        exit 1
    fi
}

function test_get_experiments(){
    configure_account
    printf "\naccount created successfully"
    # capturing project id
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}' )
    printf "\nprojectID is ${projectID}\n"
    save_experiment 

    NoOfExperimentsBefore=$(echo "q" | litmusctl get chaos-experiments --project-id=$projectID | grep "${expName}" | wc -l )
    # cleanup exp and infra
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
    delete_experiment $expName
    NoOfExperimentsAfter=$(echo "q" | litmusctl get chaos-experiments --project-id=$projectID | grep "${expName}" | wc -l )
    if [[ ${NoOfExperimentsBefore} -ge 1 ]] && [[ ${NoOfExperimentsAfter} -eq 0 ]]; then
        echo -e "\n[Info]: litmusctl get chaos-experiments working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl get chaos-experiments not working as expected\n"
        exit 1
    fi

}
function test_delete_experiment(){
    configure_account
    printf "\naccount created successfully"
    # capturing project id
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}' )
    printf "\nprojectID is ${projectID}"

    # create before deleting
    save_experiment
    printf "\nexperiment id should have been ${expName}"
    
    echo "y" | litmusctl delete chaos-experiment $expName --project-id=$projectID

    NoOfExperiments=$(echo "q" | litmusctl get chaos-experiments --output="table" --project-id=${projectID} | grep "${expName}" |  wc -l )
    # cleanup exp and infra
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
    if [[ ${NoOfExperiments} -eq 0 ]];then
        echo -e "\n[Info]: litmusctl delete chaos-experiment working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl delete chaos-experiment not working as expected\n"
        exit 1
    fi

}

# successfully failing
function test_run_experiment(){
    configure_account
    printf "\naccount created successfully"
    # capturing project id
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}' )
    printf "\nprojectID is ${projectID}"

    # create before deleting
    save_experiment
    # run experiment here
    echo "q" | litmusctl get chaos-experiments  --project-id=${projectID} --output="table"
    litmusctl run chaos-experiment --project-id=$projectID --experiment-id=$expName

    # get the experiment-run
    NoOfExperimentsRun=$(litmusctl get chaos-experiment-runs --project-id=$projectID | grep "$expName" | wc -l )
    # cleanup exp and infra
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
    delete_experiment $expName
    if [[ $NoOfExperimentsRun -ge 1 ]];then
        echo -e "\n[Info]: litmusctl run chaos-experiment working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl run chaos-experiment not working as expected\n"
        exit 1
    fi

}

function test_get_experiment_run(){
    configure_account
    printf "\naccount created successfully"
    # capturing project id
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}' )
    printf "\nprojectID is ${projectID}"

    # create before deleting
    save_experiment
    # run experiment here
    litmusctl run chaos-experiment --project-id=$projectID --experiment-id=$expName

    # get the experiments
    NoOfExperimentsRun=$(litmusctl get chaos-experiment-runs --project-id=$projectID | grep "$expName" | wc -l )
    # cleanup exp and infra
    disconnect_infra ${infraName} $projectID
    infra_cleanup
    delete_environment $envName
    delete_experiment $expName
    echo "$NoOfExperimentsRun"
    if [[ $NoOfExperimentsRun -ge 1 ]];then
        echo -e "\n[Info]: litmusctl get chaos-experiment-runs working fine ✓\n"
        exit 0
    else 
        echo -e "\n[Error]: litmusctl get chaos-experiment-runs not working as expected\n"
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
    exit 1
    ;;
  test_get_infras)
    test_get_infras
    ;;
  test_create_project)
    test_create_project
    ;;
  test_disconnect_infra)
    test_disconnect_infra
    ;;
  test_create_environment)
    test_create_environment
    ;;
  test_get_environment)
    test_get_environment
    ;;
  test_delete_environment)
    test_delete_environment
    ;;
  test_save_experiment)
    test_save_experiment
    ;;
  test_get_experiments)
    test_get_experiments
    ;;
  test_delete_experiment)
    test_delete_experiment
    ;;
  test_run_experiment)
    test_run_experiment
    ;;
  test_get_experiment_run)
    test_get_experiment_run
    ;;
  *)
    echo "Invalid Arguments"
    exit 1
esac