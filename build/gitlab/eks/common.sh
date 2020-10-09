#!/bin/bash
# This script will
# check the dependencies are installed or not.

function need_tool(){
  local tool="${1}"
  local url="${2}"

  echo >&2 "${tool} is required. Please follow ${url}"
  exit 1
}

function need_kubectl(){
  need_tool "kubectl" "https://kubernetes.io/docs/tasks/tools/install-kubectl"
}

function need_helm(){
  need_tool "helm" "https://github.com/helm/helm/#install"
}

function need_eksctl(){
  need_tool "eksctl" "https://eksctl.io"
}

function validate_tools(){
  for tool in "$@"
  do
    # Basic check for installation
    command -v "${tool}" > /dev/null 2>&1 || "need_${tool}"
  done
}

function check_helm_3(){
  set +e
  helm version --short --client | grep -q '^v3\.[0-9]\{1,\}'
  IS_HELM_3=$?
  set -e

  echo $IS_HELM_3
}
