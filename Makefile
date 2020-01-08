# Makefile for building litmus-e2 https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml


IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

# list only our namespaced dGirectories
PACKAGES = $(shell go list ./... | grep -v '/vendor/')


.PHONY: install
install:

	@echo "-------------------"
	@echo "Installing Litmus"
	@echo "-------------------"
	@echo "Creatign crds"
	@kubectl create -f https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml
	@echo "Creating rbac"
	@kubectl create -f https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/rbac.yaml
	@echo "Creating chaos-operator"
	@kubectl create -f https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/operator.yaml
	@echo "Litmus installed successfully"


.PHONY: deployapp
deployapp:

	@echo "--------------------"
	@echo "Deploying app"
	@echo "--------------------"
#	@go run test/deploy_app.go
	@ansible-playbook nginx/deployment/app_deploy.yml -vv
	@kubectl get deploy nginx -n litmus
	@kubectl annotate deploy/nginx litmuschaos.io/chaos="true" -n litmus

.PHONY: liveness
liveness:

	@echo "-------------------"
	@echo "Checking liveness"
	@echo "-------------------"
	@ansible-playbook nginx/liveness/liveness.yml -vv
	@kubectl get pods -n litmus
	
.PHONY: pod-delete
pod-delete:

	@echo "-------------------------------"
	@echo "Running pod-delete experiment"
	@echo "--------------------------------"
	@ansible-playbook experiments/generic/pod-delete.yml -vv

.PHONY: container-kill
container-kill:

	@echo "-------------------------------"
	@echo "Running container-kill experiment"
	@echo "--------------------------------"
	@ansible-playbook experiments/generic/container-kill.yml -vv

.PHONY: pod-network-latency
pod-network-latency:

	@echo "-------------------------------"
	@echo "Running pod-network-latency experiment"
	@echo "--------------------------------"
	@ansible-playbook experiments/generic/pod-network-latency.yml -vv

.PHONY: pod-network-loss
pod-network-loss:

	@echo "-------------------------------"
	@echo "Running pod-network-loss experiment"
	@echo "--------------------------------"
	@ansible-playbook experiments/generic/pod-network-loss.yml -vv

.PHONY: pod-network-corruption
pod-network-corruption:

	@echo "-------------------------------"
	@echo "Running pod-network-corruption experiment"
	@echo "--------------------------------"
	@ansible-playbook experiments/generic/pod-network-corruption.yml -vv

.PHONY: node-cpu-hog
node-cpu-hog:

	@echo "-------------------------------"
	@echo "Running node-cpu-hog experiment"
	@echo "--------------------------------"
	@ansible-playbook experiments/infra/node-cpu-hog.yml -vv

.PHONY: app-cleanup
app-cleanup:

	@echo "--------------------"
	@echo "Deleting litmus"
	@echo "--------------------"
	@kubectl delete chaosengine -n litmus --all
	@kubectl delete chaosexperiment -n litmus --all
	@kubectl delete deploy -n litmus --all
	@kubectl delete svc nginx -n litmus
	@kubectl delete -f https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml
	@kubectl delete -f https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/rbac.yaml
