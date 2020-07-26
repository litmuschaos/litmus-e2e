# Makefile for building litmus-e2e
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

# list only our namespaced directories
PACKAGES = $(shell go list ./... | grep -v '/vendor/')

# docker info
DOCKER_REPO ?= litmuschaos
DOCKER_IMAGE ?= litmus-e2e
DOCKER_TAG ?= ci

TESTPATH ?= /home/udit/go/src/github.com/litmuschaos/litmus-e2e


.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test tests/install-litmus_test.go -v -count=1"

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test tests/app-deploy_test.go -v -count=1"

.PHONY: liveness
liveness:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
     "cd $(TESTPATH) && source ./vars.sh && go test tests/app-liveness_test.go -v -count=1"

.PHONY: auxiliary-app
auxiliary-app:

	@echo "-----------------------"
	@echo "Deploying Auxiliary App"
	@echo "-----------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test tests/auxiliary-app_test.go -v -count=1"

.PHONY: pod-delete
pod-delete:

	@echo "-------------------------------"
	@echo "Running pod-delete experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-delete_test.go -v -count=1"

.PHONY: container-kill
container-kill:

	@echo "-------------------------------"
	@echo "Running container-kill experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/container-kill_test.go -v -count=1"

.PHONY: pod-network-latency
pod-network-latency:

	@echo "--------------------------------------"
	@echo "Running pod-network-latency experiment"
	@echo "--------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-network-latency_test.go -v -count=1"

.PHONY: pod-network-loss
pod-network-loss:

	@echo "-----------------------------------"
	@echo "Running pod-network-loss experiment"
	@echo "-----------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-network-loss_test.go -v -count=1"


.PHONY: pod-network-corruption
pod-network-corruption:

	@echo "-------------------------------"
	@echo "Running pod-network-corruption experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-network-corruption_test.go -v -count=1"

.PHONY: pod-cpu-hog
pod-cpu-hog:

	@echo "-------------------------------"
	@echo "Running pod-cpu-hog experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-cpu-hog_test.go -v -count=1"

.PHONY: node-cpu-hog
node-cpu-hog:

	@echo "-------------------------------"
	@echo "Running node-cpu-hog experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/node-cpu-hog_test.go -v -count=1"

.PHONY: node-drain
node-drain:

	@echo "---------------------------------"
	@echo "Running node-drain experiment"
	@echo "---------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/node-drain_test.go -v -count=1"

.PHONY: disk-fill
disk-fill:

	@echo "--------------------------------"
	@echo "Running disk-fill experiment"
	@echo "--------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/disk-fill_test.go -v -count=1"

.PHONY: node-memory-hog
node-memory-hog:

	@echo "----------------------------------"
	@echo "Running node-memory-hog experiment"
	@echo "----------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/node-memory-hog_test.go -v -count=1"

.PHONY: pod-memory-hog
pod-memory-hog:

	@echo "---------------------------------"
	@echo "Running pod-memory-hog experiment"
	@echo "---------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-memory-hog_test.go -v -count=1"

.PHONY: kubelet-service-kill
kubelet-service-kill:

	@echo "---------------------------------------"
	@echo "Running kubelet-service-kill experiment"
	@echo "---------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/kubelet-service-kill_test.go -v -count=1"

.PHONY: node-taint
node-taint:

	@echo "---------------------------------------"
	@echo "Running node-taint experiment"
	@echo "---------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/node-taint_test.go -v -count=1"

.PHONY: pod-network-duplication
pod-network-duplication:

	@echo "------------------------------------------"
	@echo "Running pod-network-duplication experiment"
	@echo "------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test tests/pod-network-duplication_test.go -v -count=1"	  


.PHONY: operator-reconcile-resiliency-check
 operator-reconcile-resiliency-check:

	@echo "--------------------------------------------"
	@echo "Running  Operator Reconcile Resiliency Check"
	@echo "--------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test $(TESTPATH)/operator/reconcile-resiliency_test.go -v -count=1"

.PHONY: admin-mode-check
admin-mode-check:

	@echo "------------------------"
	@echo "Running Admin Mode Check"
	@echo "------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	"cd $(TESTPATH) && source ./vars.sh && go test $(TESTPATH)/operator/admin-mode_test.go -v -count=1"	


.PHONY: e2e-metrics
e2e-metrics:

	@echo "----------------------------"
	@echo "Pipeline Coverage Percentage"
	@echo "----------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && bash metrics/e2e-metrics"

.PHONY: app-cleanup
app-cleanup:

	@echo "--------------------"
	@echo "Deleting litmus"
	@echo "--------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test tests/litmus-cleanup_test.go -v -count=1"

.PHONY: pipeline-status-update
pipeline-status-update:

	@echo "------------------------"
	@echo "Updating Pipeline Status"
	@echo "------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test tests/pipeline-update_test.go -v -count=1"


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
	 
#################################################################################
#################            Ansible Experiment BDDS            #################
#################################################################################

.PHONY: go-experiment-cleanup
go-experiment-cleanup:

	@echo "-----------------------------"
	@echo "Running Go Experiment Cleanup"
	@echo "-----------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && bash cleanup.sh"

.PHONY: ansible-pod-delete
ansible-pod-delete:

	@echo "-------------------------------------"
	@echo "Running Ansible Pod Delete Experiemnt"
	@echo "-------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-pod-delete_test.go -v -count=1"

.PHONY: ansible-container-kill
ansible-container-kill:

	@echo "-------------------------------------"
	@echo "Running Ansible Container Kill Experiemnt"
	@echo "-------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-container-kill_test.go -v -count=1"

.PHONY: ansible-disk-fill
ansible-disk-fill:

	@echo "-------------------------------------"
	@echo "Running Ansible disk fill Experiemnt"
	@echo "-------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-disk-fill_test.go -v -count=1"

.PHONY: ansible-node-cpu-hog
ansible-node-cpu-hog:

	@echo "---------------------------------------"
	@echo "Running Ansible Node CPU Hog Experiemnt"
	@echo "---------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-node-cpu-hog_test.go -v -count=1"

.PHONY: ansible-node-memory-hog
ansible-node-memory-hog:

	@echo "------------------------------------------"
	@echo "Running Ansible Node Memory Hog Experiemnt"
	@echo "------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-node-memory-hog_test.go -v -count=1"

.PHONY: ansible-pod-cpu-hog
ansible-pod-cpu-hog:

	@echo "--------------------------------------"
	@echo "Running Ansible Pod CPU Hog Experiemnt"
	@echo "--------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-pod-cpu-hog_test.go -v -count=1"

.PHONY: ansible-pod-memory-hog
ansible-pod-memory-hog:

	@echo "-----------------------------------------"
	@echo "Running Ansible Pod Memory Hog Experiemnt"
	@echo "-----------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-pod-memory-hog_test.go -v -count=1"

.PHONY: ansible-pod-network-corruption
ansible-pod-network-corruption:

	@echo "-------------------------------------------------"
	@echo "Running Ansible Pod Network Corruption Experiemnt"
	@echo "-------------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-pod-network-corruption_test.go -v -count=1"

.PHONY: ansible-pod-network-latency
ansible-pod-network-latency:

	@echo "----------------------------------------------"
	@echo "Running Ansible Pod Network Latency Experiemnt"
	@echo "----------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-pod-network-latency_test.go -v -count=1"


.PHONY: ansible-pod-network-loss
ansible-pod-network-loss:

	@echo "-------------------------------------------"
	@echo "Running Ansible Pod Network Loss Experiemnt"
	@echo "-------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/ansible-pod-network-loss_test.go -v -count=1"


.PHONY: kubelet-service-kill
kubelet-service-kill:

	@echo "-----------------------------------------------"
	@echo "Running Ansible Kubelet Service Kill Experiemnt"
	@echo "-----------------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/kubelet-service-kill_test.go -v -count=1"


.PHONY: node-drain
node-drain:

	@echo "-------------------------------------"
	@echo "Running Ansible Node Drain Experiemnt"
	@echo "-------------------------------------"
	@sshpass -p ${litmus_pass} ssh -o StrictHostKeyChecking=no ${litmus_user}@${litmus_ip} -p ${port} -tt \
	 "cd $(TESTPATH) && source ./vars.sh && go test ansible/node-drain_test.go -v -count=1"	
