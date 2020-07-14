# Makefile for building litmus-e2e
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

# list only our namespaced directories
PACKAGES = $(shell go list ./... | grep -v '/vendor/')

# docker info
DOCKER_REPO ?= litmuschaos
DOCKER_IMAGE ?= litmus-openebs-tests
DOCKER_TAG ?= ci

TESTPATH ?= /home/udit/go/src/github.com/litmuschaos/litmus-e2e

.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export OPERATOR_REPO_NAME=${OPERATOR_REPO_NAME} && export RUNNER_REPO_NAME=${RUNNER_REPO_NAME} && export RUNNER_IMAGE=${RUNNER_IMAGE} && \
	 export OPERATOR_IMAGE=${OPERATOR_IMAGE} && export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} && \
	 export OPERATOR_IMAGE_TAG=${OPERATOR_IMAGE_TAG} && export RUNNER_IMAGE_TAG=${RUNNER_IMAGE_TAG} && \
	 go test $(TESTPATH)/tests/install-litmus_test.go -v -count=1"


.PHONY: build-openebs
build-openebs:

	@echo "-------------"
	@echo "Build OpenEBS"
	@echo "-------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/tests/openebs-setup_test.go -v -count=1"

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/tests/app-deploy_test.go -v -count=1"

.PHONY: openebs-target-pod-failure
openebs-target-pod-failure:

	@echo "----------------------------------"
	@echo "Running OpenEBS Target Pod Failure"
	@echo "----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-target-pod-failure_test.go -v -count=1"

.PHONY: openebs-pool-container-failure
openebs-pool-container-failure:

	@echo "--------------------------------------"
	@echo "Running OpenEBS Pool Container Failure"
	@echo "--------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt\
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-pool-container-failure_test.go -v -count=1"

.PHONY: openebs-pool-pod-failure
openebs-pool-pod-failure:

	@echo "--------------------------------"
	@echo "Running OpenEBS Pool Pod Failure"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-pool-pod-failure_test.go -v -count=1 -timeout=20m"

.PHONY: openebs-target-container-failure
openebs-target-container-failure:

	@echo "----------------------------------------"
	@echo "Running OpenEBS Target Container Failure"
	@echo "----------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-target-container-failure_test.go -v -count=1"

.PHONY: openebs-target-network-delay
openebs-target-network-delay:

	@echo "-------------------------------------"
	@echo "Running OpenEBS Target Network Delay"
	@echo "-------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-target-network-delay_test.go -v -count=1"


.PHONY: openebs-target-network-loss
openebs-target-network-loss:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-target-network-loss_test.go -v -count=1"

.PHONY: openebs-control-plane-chaos
openebs-control-plane-chaos:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Control Plane Chaos"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/tests/openebs-control-plane-chaos_test.go -v -count=1"

.PHONY: e2e-metrics
e2e-metrics:

	@echo "----------------------------"
	@echo "Pipeline Coverage Percentage"
	@echo "----------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export CI_PIPELINE_ID=${CI_PIPELINE_ID} && cd $(TESTPATH) && bash metrics/e2e-metrics"


.PHONY: app-cleanup
app-cleanup:

	@echo "-------------------"
	@echo "Application Cleanup"
	@echo "-------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/tests/app-cleanup_test.go -v -count=1"


.PHONY: litmus-cleanup
litmus-cleanup:

	@echo "--------------"
	@echo "Litmus Cleanup"
	@echo "--------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  go test $(TESTPATH)/tests/litmus-cleanup_test.go -v -count=1"


.PHONY: openebs-cleanup
openebs-cleanup:

	@echo "---------------"
	@echo "OpenEBS Cleanup"
	@echo "---------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/tests/openebs-cleanup_test.go -v -count=1"

.PHONY: deps
deps: _build_check_docker godeps docker-build

_build_check_docker:
	@if [ $(IS_DOCKER_INSTALLED) -eq 1 ]; \
		then echo "" \
		&& echo "ERROR:\tdocker is not installed. Please install it before build." \
		&& echo "" \
		&& exit 1; \
		fi;

godeps:
	@echo "INFO:\tverifying dependencies for chaos-ci-lib build ..."
	@go get -u -v golang.org/x/lint/golint
	@go get -u -v golang.org/x/tools/cmd/goimports

docker-build: 
	@echo "----------------------------"
	@echo "--> Build chaos-ci-lib image" 
	@echo "----------------------------"
	# Dockerfile available in the repo root
	sudo docker build . -f Dockerfile -t $(DOCKER_REPO)/$(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: push
push: docker-push

docker-push:
	@echo "---------------------------"
	@echo "--> Push chaos-ci-lib image" 
	@echo "---------------------------"
	REPONAME="litmuschaos" IMGNAME="litmus-openebs-tests" IMGTAG="ci" ./build/push 