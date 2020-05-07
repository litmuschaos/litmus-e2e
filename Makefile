# Makefile for building litmus-e2e
TESTPATH ?= /home/udit/go/src/github.com/litmuschaos/litmus-e2e/tests/

.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	 export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export OperatorRepoName=${OperatorRepoName} && export RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	 export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	 export OperatorImageTag=${OperatorImageTag} && export RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
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
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	  go test $(TESTPATH)/openebs-target-pod-failure_test.go -v -count=1"

.PHONY: openebs-pool-container-failure
openebs-pool-container-failure:

	@echo "--------------------------------------"
	@echo "Running OpenEBS Pool Container Failure"
	@echo "--------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	  go test $(TESTPATH)/openebs-pool-container-failure_test.go -v -count=1"

.PHONY: openebs-pool-pod-failure
openebs-pool-pod-failure:

	@echo "--------------------------------"
	@echo "Running OpenEBS Pool Pod Failure"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	  go test $(TESTPATH)/openebs-pool-pod-failure_test.go -v -count=1 -timeout=20m"

.PHONY: openebs-target-container-failure
openebs-target-container-failure:

	@echo "----------------------------------------"
	@echo "Running OpenEBS Target Container Failure"
	@echo "----------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	  go test $(TESTPATH)/openebs-target-container-failure_test.go -v -count=1"

.PHONY: openebs-target-network-delay
openebs-target-network-delay:

	@echo "-------------------------------------"
	@echo "Running OpenEBS Target Network Delay"
	@echo "-------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	  go test $(TESTPATH)/openebs-target-network-delay_test.go -v -count=1"


.PHONY: openebs-target-network-loss
openebs-target-network-loss:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	  go test $(TESTPATH)/openebs-target-network-loss_test.go -v -count=1"

.PHONY: openebs-control-plane-chaos
openebs-control-plane-chaos:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Control Plane Chaos"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt "export IMAGE_TAG=${IMAGE_TAG} && \
	  export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	  export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	  export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
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
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	  go test $(TESTPATH)/litmus-cleanup_test.go -v -count=1"


.PHONY: openebs-cleanup
openebs-cleanup:

	@echo "---------------"
	@echo "OpenEBS Cleanup"
	@echo "---------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "go test $(TESTPATH)/openebs-cleanup_test.go -v -count=1"

