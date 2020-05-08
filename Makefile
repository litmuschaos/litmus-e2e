# Makefile for building litmus-e2e
TESTPATH ?= /home/udit/go/src/github.com/litmuschaos/litmus-e2e/tests

.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export OPERATOR_REPO_NAME=${OPERATOR_REPO_NAME} && export RUNNER_REPO_NAME=${RUNNER_REPO_NAME} && export RUNNER_IMAGE=${RUNNER_IMAGE} && \
	 export OPERATOR_IMAGE=${OPERATOR_IMAGE} && export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} && \
	 export OPERATOR_IMAGE_TAG=${OPERATOR_IMAGE_TAG} && export RUNNER_IMAGE_TAG=${RUNNER_IMAGE_TAG} && \
	 go test $(TESTPATH)/install-litmus_test.go -v -count=1"


.PHONY: build-openebs
build-openebs:

	@echo "-------------"
	@echo "Build OpenEBS"
	@echo "-------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 go test $(TESTPATH)/openebs-setup_test.go -v -count=1

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	go test $(TESTPATH)/app-deploy_test.go -v -count=1

.PHONY: openebs-target-pod-failure
openebs-target-pod-failure:

	@echo "----------------------------------"
	@echo "Running OpenEBS Target Pod Failure"
	@echo "----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-target-pod-failure_test.go -v -count=1"

.PHONY: openebs-pool-container-failure
openebs-pool-container-failure:

	@echo "--------------------------------------"
	@echo "Running OpenEBS Pool Container Failure"
	@echo "--------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt\
	  "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-pool-container-failure_test.go -v -count=1"

.PHONY: openebs-pool-pod-failure
openebs-pool-pod-failure:

	@echo "--------------------------------"
	@echo "Running OpenEBS Pool Pod Failure"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	  "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-pool-pod-failure_test.go -v -count=1 -timeout=20m"

.PHONY: openebs-target-container-failure
openebs-target-container-failure:

	@echo "----------------------------------------"
	@echo "Running OpenEBS Target Container Failure"
	@echo "----------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	  "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-target-container-failure_test.go -v -count=1"

.PHONY: openebs-target-network-delay
openebs-target-network-delay:

	@echo "-------------------------------------"
	@echo "Running OpenEBS Target Network Delay"
	@echo "-------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-target-network-delay_test.go -v -count=1"


.PHONY: openebs-target-network-loss
openebs-target-network-loss:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-target-network-loss_test.go -v -count=1"

.PHONY: openebs-control-plane-chaos
openebs-control-plane-chaos:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Control Plane Chaos"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	  go test $(TESTPATH)/openebs-control-plane-chaos_test.go -v -count=1"

.PHONY: app-cleanup
app-cleanup:

	@echo "-------------------"
	@echo "Application Cleanup"
	@echo "-------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "go test $(TESTPATH)/app-cleanup_test.go -v -count=1"


.PHONY: litmus-cleanup
litmus-cleanup:

	@echo "--------------"
	@echo "Litmus Cleanup"
	@echo "--------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	  go test $(TESTPATH)/litmus-cleanup_test.go -v -count=1"


.PHONY: openebs-cleanup
openebs-cleanup:

	@echo "---------------"
	@echo "OpenEBS Cleanup"
	@echo "---------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "go test $(TESTPATH)/openebs-cleanup_test.go -v -count=1"

