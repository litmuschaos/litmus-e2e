# Makefile for building litmus-e2e
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

# list only our namespaced directories
PACKAGES = $(shell go list ./... | grep -v '/vendor/')

# docker info
DOCKER_REPO ?= litmuschaos
DOCKER_IMAGE ?= litmus-e2e
DOCKER_TAG ?= ci

TESTPATH ?= /home/udit/go/src/github.com/litmuschaos/litmus-e2e/tests


.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export OPERATOR_REPO_NAME=${OPERATOR_REPO_NAME} && export RUNNER_REPO_NAME=${RUNNER_REPO_NAME} && export RUNNER_IMAGE=${RUNNER_IMAGE} && \
	 export OPERATOR_IMAGE=${OPERATOR_IMAGE} && export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} && \
	 export OPERATOR_IMAGE_TAG=${OPERATOR_IMAGE_TAG} && export RUNNER_IMAGE_TAG=${RUNNER_IMAGE_TAG} && \
	 go test $(TESTPATH)/install-litmus_test.go -v -count=1"

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/app-deploy_test.go -v -count=1"

.PHONY: liveness
liveness:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
     "export CGO_ENABLED=0 && go test $(TESTPATH)/app-liveness_test.go -v -count=1"

.PHONY: auxiliary-app
auxiliary-app:

	@echo "-----------------------"
	@echo "Deploying Auxiliary App"
	@echo "-----------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/auxiliary-app_test.go -v -count=1"

.PHONY: pod-delete
pod-delete:

	@echo "-------------------------------"
	@echo "Running pod-delete experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/pod-delete_test.go -v -count=1"

.PHONY: container-kill
container-kill:

	@echo "-------------------------------"
	@echo "Running container-kill experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/container-kill_test.go -v -count=1"

.PHONY: pod-network-latency
pod-network-latency:

	@echo "--------------------------------------"
	@echo "Running pod-network-latency experiment"
	@echo "--------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/pod-network-latency_test.go -v -count=1"

.PHONY: pod-network-loss
pod-network-loss:

	@echo "-----------------------------------"
	@echo "Running pod-network-loss experiment"
	@echo "-----------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/pod-network-loss_test.go -v -count=1"


.PHONY: pod-network-corruption
pod-network-corruption:

	@echo "-------------------------------"
	@echo "Running pod-network-corruption experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/pod-network-corruption_test.go -v -count=1"

.PHONY: pod-cpu-hog
pod-cpu-hog:

	@echo "-------------------------------"
	@echo "Running pod-cpu-hog experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/pod-cpu-hog_test.go -v -count=1"

.PHONY: node-cpu-hog
node-cpu-hog:

	@echo "-------------------------------"
	@echo "Running node-cpu-hog experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/node-cpu-hog_test.go -v -count=1"

.PHONY: node-drain
node-drain:

	@echo "---------------------------------"
	@echo "Running node-drain experiment"
	@echo "---------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/node-drain_test.go -v -count=1"

.PHONY: disk-fill
disk-fill:

	@echo "--------------------------------"
	@echo "Running disk-fill experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/disk-fill_test.go -v -count=1"

.PHONY: node-memory-hog
node-memory-hog:

	@echo "----------------------------------"
	@echo "Running node-memory-hog experiment"
	@echo "----------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/node-memory-hog_test.go -v -count=1"

.PHONY: pod-memory-hog
pod-memory-hog:

	@echo "---------------------------------"
	@echo "Running pod-memory-hog experiment"
	@echo "---------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/pod-memory-hog_test.go -v -count=1"

.PHONY:  operator-reconcile-resiliency-check
 operator-reconcile-resiliency-check:

	@echo "--------------------------------------------"
	@echo "Running  Operator Reconcile Resiliency Check"
	@echo "--------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/reconcile-resiliency_test.go -v -count=1"

.PHONY: admin-mode-check
admin-mode-check:

	@echo "------------------------"
	@echo "Running Admin Mode Check"
	@echo "------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"export CGO_ENABLED=0 && export CI_JOB_ID=${CI_JOB_ID} && export GITHUB_TOKEN=${GITHUB_TOKEN} && export EXPERIMENT_REPO_NAME=${EXPERIMENT_REPO_NAME} && \
	 export EXPERIMENT_IMAGE=${EXPERIMENT_IMAGE} && export EXPERIMENT_IMAGE_TAG=${EXPERIMENT_IMAGE_TAG} &&  \
	 go test $(TESTPATH)/admin-mode_test.go -v -count=1"	

.PHONY: app-cleanup
app-cleanup:

	@echo "--------------------"
	@echo "Deleting litmus"
	@echo "--------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "export CGO_ENABLED=0 && go test $(TESTPATH)/litmus-cleanup_test.go -v -count=1"

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
	REPONAME="litmuschaos" IMGNAME="litmus-e2e" IMGTAG="ci" ./build/push	 
	 