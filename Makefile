# Makefile for building litmus-e2e
TESTPATH ?= /home/udit/go/src/github.com/litmuschaos/litmus-e2e/tests/


.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export OperatorRepoName=${OperatorRepoName} && RunnerRepoName=${RunnerRepoName} && export RunnerImage=${RunnerImage} && \
	 export OperatorImage=${OperatorImage} && export ExperimentImage=${ExperimentImage} && export ExperimentImageTag=${ExperimentImageTag} && \
	 export OperatorImageTag=${OperatorImageTag} && RunnerImageTag=${RunnerImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/install-litmus_test.go -v -count=1"

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "go test $(TESTPATH)/app-deploy_test.go -v -count=1"

.PHONY: liveness
liveness:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
     "go test $(TESTPATH)/app-liveness_test.go -v -count=1"

.PHONY: auxiliary-app
auxiliary-app:

	@echo "-----------------------"
	@echo "Deploying Auxiliary App"
	@echo "-----------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "go test $(TESTPATH)/auxiliary-app_test.go -v -count=1"

.PHONY: pod-delete
pod-delete:

	@echo "-------------------------------"
	@echo "Running pod-delete experiment"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/pod-delete_test.go -v -count=1"

.PHONY: container-kill
container-kill:

	@echo "-------------------------------"
	@echo "Running container-kill experiment"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/container-kill_test.go -v -count=1"

.PHONY: pod-network-latency
pod-network-latency:

	@echo "--------------------------------------"
	@echo "Running pod-network-latency experiment"
	@echo "--------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/pod-network-latency_test.go -v -count=1"

.PHONY: pod-network-loss
pod-network-loss:

	@echo "-----------------------------------"
	@echo "Running pod-network-loss experiment"
	@echo "-----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/pod-network-loss_test.go -v -count=1"


.PHONY: pod-network-corruption
pod-network-corruption:

	@echo "-------------------------------"
	@echo "Running pod-network-corruption experiment"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/pod-network-corruption_test.go -v -count=1"

.PHONY: pod-cpu-hog
pod-cpu-hog:

	@echo "-------------------------------"
	@echo "Running pod-cpu-hog experiment"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/pod-cpu-hog_test.go -v -count=1'

.PHONY: node-cpu-hog
node-cpu-hog:

	@echo "-------------------------------"
	@echo "Running node-cpu-hog experiment"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/node-cpu-hog_test.go -v -count=1"

.PHONY: node-drain
node-drain:

	@echo "---------------------------------"
	@echo "Running node-drain experiment"
	@echo "---------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/node-drain_test.go -v -count=1"

.PHONY: disk-fill
disk-fill:

	@echo "--------------------------------"
	@echo "Running disk-fill experiment"
	@echo "--------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/disk-fill_test.go -v -count=1"

.PHONY: node-memory-hog
node-memory-hog:

	@echo "----------------------------------"
	@echo "Running node-memory-hog experiment"
	@echo "----------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/node-memory-hog_test.go -v -count=1"

.PHONY: pod-memory-hog
pod-memory-hog:

	@echo "---------------------------------"
	@echo "Running pod-memory-hog experiment"
	@echo "---------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/pod-memory-hog_test.go -v -count=1"

.PHONY:  operator-reconcile-resiliency-check
 operator-reconcile-resiliency-check:

	@echo "--------------------------------------------"
	@echo "Running  Operator Reconcile Resiliency Check"
	@echo "--------------------------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/reconcile-resiliency_test.go -v -count=1"

.PHONY: admin-mode-check
admin-mode-check:

	@echo "------------------------"
	@echo "Running Admin Mode Check"
	@echo "------------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	"export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export ExperimentRepoName=${ExperimentRepoName} && \
	 export RunnerImage=${RunnerImage} && export ExperimentImageTag=${ExperimentImageTag} && export ChaosDuration=${ChaosDuration} && \
	 go test $(TESTPATH)/admin-mode_test.go -v -count=1"	

.PHONY: app-cleanup
app-cleanup:

	@echo "--------------------"
	@echo "Deleting litmus"
	@echo "--------------------"
	@sshpass -p ${pass} ssh -o StrictHostKeyChecking=no ${user}@${ip} -p ${port} -tt \
	 "go test $(TESTPATH)/litmus-cleanup_test.go -v -count=1"
	 