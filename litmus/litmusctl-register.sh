#!/usr/bin/expect -f

## [STILL IN DEVELOPMENT]

## Prerequisites 
# litmusctl should have the permissions to create role/rolebindings

## expect is used for expecting an interactive prompts.
## send is used for sending inputs to the prompts.
## PROJECT is Project Number, Can be taken from dropdown in Portal UI

## INSTALLATION_MODE, 1 for Cluster Mode and 2 for Namespaced Mode
array set MODES {
    1 "cluster"
    2 "namespace"
}

## PLATFORM, 1. AWS, 2. GKE, 3. Openshift, 4. Rancher, 5. Others
array set Platforms {
    1 "AWS" 
    2 "GKE" 
    3 "Openshift"
    4 "Rancher"
    5 "Others"
}

##Setting Inputs before Executing the Script
set HOST_URL [lindex $argv 0];
set USERNAME admin
set PASSWORD litmus
set PROJECT 1
set INSTALLATION_MODE [lindex $argv 1];
set AGENT_NAME "External Agent"
set AGENT_DESCRIPTION "My External Agent"
set PLATFORM 5
set NAMESPACE litmus
set SERVICE_ACCOUNT litmus

set timeout 300

## Connecting new agent
spawn litmusctl agent connect

match_max 100000

## Input Host URL
expect -exact "🔥 Connecting LitmusChaos agent\r
\r
📶 Please enter LitmusChaos details --\r
👉 Host URL where litmus is installed: "
send -- "$HOST_URL\r"

## Input Admin Credentials
expect -exact "🤔 Username \[admin\]: "
send -- "$USERNAME\r"

expect -exact "🙈 Password: "
send -- "$PASSWORD\r"

expect -exact "✅ Login Successful!\r"

# Select the project
expect -exact "\r
✨ Projects List:\r
1.  admin's project\r
\r
🔎 Select Project: "
send -- "$PROJECT\r"

## Select the installation Mode
expect -exact "\r
🔌 Installation Modes:\r
1. Cluster\r
2. Namespace\r
\r
👉 Select Mode \[cluster\]: "
send -- "$INSTALLATION_MODE\r"

## Prerequisites check
if {$INSTALLATION_MODE == 1} {
expect -exact "\r
🏃 Running prerequisites check....\r
🔑  clusterrole - ✅\r
🔑  clusterrolebinding - ✅\r
\r
🌟 Sufficient permissions. Connecting Agent\r
\r"
} else {
expect -exact "\r
🏃 Running prerequisites check....\r
🔑  role - ✅\r
🔑  rolebinding - ✅\r
\r
🌟 Sufficient permissions. Connecting Agent\r
\r"
}

## Enter Agent Details (Name & Description)
expect -exact "🔗 Enter the details of the agent ----\r
🤷 Agent Name: "
send -- "$AGENT_NAME\r"

expect -exact "📘 Agent Description: "
send -- "$AGENT_DESCRIPTION\r"

## Select the Agent's Platform
expect -exact "📦 Platform List\r
1. AWS\r
2. GKE\r
3. Openshift\r
4. Rancher\r
5. Others\r
🔎 Select Platform \[Others\]: "
send -- "$PLATFORM\r"

## Enter Namespace
expect -exact "📁 Enter the namespace (new or existing) \[litmus\]: "
send -- "$NAMESPACE\r"

## Enter Service Account for Agent
expect -exact "🔑 Enter service account \[litmus\]: "
send -- "$SERVICE_ACCOUNT\r"

## Check Summary and Select Y for registering agent.
expect -exact "\r
📌 Summary --------------------------\r
\r
Agent Name:         $AGENT_NAME\r
Agent Description:  $AGENT_DESCRIPTION\r
Platform Name:      $Platforms($PLATFORM)\r
Namespace:          $NAMESPACE (new)\r
Service Account:    $SERVICE_ACCOUNT (new)\r
Installation Mode:  $MODES($INSTALLATION_MODE)\r
\r
-------------------------------------\r
\r"

expect -exact "🤷 Do you want to continue with the above details? \[Y/N\]: "
## Change this to N, if you don't want to connect agent. 
send -- "Y\r"  

expect eof