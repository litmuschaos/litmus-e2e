#!/bin/bash

set -o pipefail

# All intermediate functions are defined in utils.sh
source utils.sh

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

components="subscriber,chaos-exporter,chaos-operator-ce,event-tracker,workflow-controller"
defaultTolerations='[{"tolerationSeconds":0,"key":"special","value":"true","Operator":"Equal","effect":"NoSchedule"}]'
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
    # configure infra 
    configure_infra "" ""
    # get infra ID
    infraID=$( litmusctl get chaos-infra --project-id=$projectID | grep "$infraName" | awk '{print$1}')

    # wait for the infra to be activated
    wait_infra_to_activate $infraName $projectID 
    litmusctl save chaos-experiment --file="./Cypress/cypress/fixture/sample-workflow-default.yaml" --project-id=${projectID} --chaos-infra-id=$infraID --description="test experiment"
}

function delete_experiment(){
    experimentID=$1
    printf "\n account created successfully"
    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')
    printf "\n projectID is ${projectID}"
    echo "y" | litmusctl delete chaos-experiment $experimentID --project-id=$projectID
}


function wait_experiment_run_status() {
  wait_time=$1
  projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" | awk '{print $1}')

  # Capture experiment run status (assuming output has one line)
  ExperimentRunStatus=$(echo "q" | ../litmusctl get chaos-experiment-runs --project-id=$projectID --experiment-id=$expName | grep "${expName}" | awk '{print $1}' )

  while [[ "$ExperimentRunStatus" != "Running" ]]; do
    echo "\n...waiting for the Experiment Status...\n"
    wait_time=$((wait_time - 10))
    if [[ $wait_time -eq 0 ]]; then
      echo -e "\n[Error]: Experiment failed to start"
      return 1
    fi
    sleep 10
    # Capture experiment run status again
    ExperimentRunStatus=$(echo "q" | ../litmusctl get chaos-experiment-runs --project-id=$projectID --experiment-id=$expName | grep "${expName}" | awk '{print $1}' )
  done
  echo "\n...Experiment Status is $ExperimentRunStatus \n"
  return 0
}

# functions for running tests for litmusctl -------------------------------------------------------------------

function test_install_with_nodeSelectors() {
    configure_account

    configure_infra $defaultNodeSelectors ""
    
    echo "Verifying nodeSelectors in all required Deployments"

    for i in $(echo $components | sed "s/,/ /g")
    do
        verify_deployment_nodeselector ${i} ${namespace} '{"beta.kubernetes.io/arch":"amd64"}'
    done

    infra_cleanup
}

function test_install_with_tolerations() {
    configure_account

    configure_infra "" $defaultTolerations

    echo "Verifying tolerations in all required Deployments"

    for i in $(echo $components | sed "s/,/ /g")
    do
        verify_deployment_tolerations ${i} ${namespace} '[{"effect":"NoSchedule","key":"special","operator":"Equal","value":"true"}]' 
    done

    infra_cleanup
}

function test_native() {
    configure_account

    configure_infra "" ""

    infra_cleanup
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

    projectID=$(echo "q" | litmusctl get projects | grep "${projectName}" |  awk '{print $1}')

    configure_infra "" ""
    # we will need to create a infra before testing for get 
    # otherwise it will fail

    noOfInfras=$(litmusctl get chaos-infra --project-id=$projectID | wc -l)
        printf "\n No of infras is ${noOfInfras}"
        printf "\n project id is ${projectID}"
    if [[ ${noOfInfras} -gt 1 ]];then
        echo -e "\n[Info]: litmusctl get chaos-infra working fine ✓\n"
        exit 1
    else 
        echo -e "\n[Error]: litmusctl get chaos-infra not working as expected\n"
        exit 1
    fi

}

function test_create_project(){
    configure_account

    litmusctl create project --name="my new project"

    noOfProjects=$(litmusctl get projects | wc -l)
    echo -e "is this actually two ${noOfProjects}"

    if [[ ${noOfProjects} -gt 2 ]];then
        echo -e "\n[Info]: litmusctl create project working fine ✓\n"
        exit 1
    else 
        echo -e "\n[Error]: litmusctl create project not working as expected\n"
        exit 1
    fi

}

function test_disconnect_infra() {
    configure_account

    configure_infra "" ""

    projectID=$(litmusctl get projects | grep "${projectName}" |  awk '{print $1}')

    chaos_infra_id=$(litmusctl get chaos-infra --project-id=$projectID | grep "${infraName}" | awk '{print $1}')

    disconnect_infra $chaos_infra_id $projectID

    chaos_infra_id=$(litmusctl get chaos-infra --project-id=$projectID | grep "${infraName}" | awk '{print $1}')

    if [[ ${chaos_delegate_id} == "" ]];then
        echo -e "\n[Info]: litmusctl disconnect chaos-infra working fine ✓\n"
    else 
        echo -e "\n[Error]: litmusctl disconnect chaos-infra not working as expected\n"
        exit 1
    fi

    infra_cleanup
}



function test_create_environment(){
    configure_account

    projectID=$(echo "q" | ../litmusctl get projects | grep "${projectName}" |  awk '{print $1}')
    printf "\n project id is ${projectID}"
    # create a environment
 
    litmusctl create chaos-environment --project-id=$projectID --name=$envName
    noOfEnvs=$(echo "q" | litmusctl list chaos-environments --project-id=$projectID | wc -l)
    printf "\n No of Environments are ${noOfEnvs}"
        
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
    noOfEnvs=$(echo "q" | litmusctl list chaos-environments --project-id=$projectID | wc -l)

    echo $noOfEnvs
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

    echo "yes" | litmusctl delete chaos-environment --project-id=$projectID --environment-id=$envName
    # get environment
    noOfEnvs=$(echo "q" | litmusctl list chaos-environments --project-id=$projectID | wc -l)
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

    # configure infra 
    configure_infra "" ""
    # get infra ID
    infraID=$( litmusctl get chaos-infra --project-id=$projectID | grep "$infraName" | awk '{print$1}')

    # wait for the infra to be activated
    wait_infra_to_activate $infraName $projectID 

    litmusctl save chaos-experiment --file="./Cypress/cypress/fixture/sample-workflow-default.yaml" --project-id=${projectID} --chaos-infra-id=$infraID --description="test experiment"

    getExperimentID=$(echo "q" | litmusctl get chaos-experiments --output="table" --project-id=$projectID | grep "$expName" | awk '{print $1}' )
    printf $getExperimentID
    # check the name is equal or not
    if [[ "$getExperimentID" = "$expName" ]];then
        echo -e "\n[Info]: litmusctl create chaos-experiment working fine ✓\n"
        # also cleanup exp and infra
        infra_cleanup
        disconnect_infra $infraName $projectID
        delete_experiment $expName
        exit 0
    else 
        echo -e "\n[Error]: litmusctl create chaos-experiment not working as expected\n"
        infra_cleanup
        disconnect_infra $infraName $projectID
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
    infra_cleanup
    disconnect_infra $infraName $projectID
    delete_experiment $expName
    NoOfExperimentsAfter=$(echo "q" | litmusctl get chaos-experiments --project-id=$projectID | grep "${expName}" | wc -l )
    printf $NoOfExperiments
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
    infra_cleanup
    disconnect_infra $infraName $projectID
    printf $NoOfExperiments
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
    printf "\nexperiment id should have been ${expName}"
    # run experiment here
    litmusctl run chaos-experiment --project-id=$projectID --experiment-id=$expName

    # get the experiment-run
    status=$(wait_experiment_run_status 60)
    infra_cleanup
    disconnect_infra $infraName $projectID
    delete_experiment $expName
    printf $status
    if [[ "${status}" = "RUNNING" ]];then
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
    printf "\nexperiment id should have been ${expName}"
    # run experiment here
    litmusctl run chaos-experiment --project-id=$projectID --experiment-id=$expName

    # get the experiments
    NoOfExperimentsRun=$(litmusctl get chaos-experiment-runs --project-id=$projectID | grep "$expName" | wc -l )
    infra_cleanup
    disconnect_infra $infraName $projectID
    delete_experiment $expName
    printf $NoOfExperimentsRun
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