# Makefile for building litmus-e2e

.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@go test tests/install-litmus_test.go -v -count=1

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@go test tests/app-deploy_test.go -v -count=1

.PHONY: liveness
liveness:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@go test tests/app-liveness_test.go -v -count=1

.PHONY: auxiliary-app
auxiliary-app:

	@echo "-----------------------"
	@echo "Deploying Auxiliary App"
	@echo "-----------------------"
	@go test tests/auxiliary-app_test.go -v -count=1

.PHONY: pod-delete
pod-delete:

	@echo "-------------------------------"
	@echo "Running pod-delete experiment"
	@echo "--------------------------------"
	@go test tests/pod-delete_test.go -v -count=1

.PHONY: container-kill
container-kill:

	@echo "-------------------------------"
	@echo "Running container-kill experiment"
	@echo "--------------------------------"
	@go test tests/container-kill_test.go -v -count=1

.PHONY: pod-network-latency
pod-network-latency:

	@echo "-------------------------------"
	@echo "Running pod-network-latency experiment"
	@echo "--------------------------------"
	@go test tests/pod-network-latency_test.go -v -count=1

.PHONY: pod-network-latency
pod-network-latency:

	@echo "-------------------------------"
	@echo "Running pod-network-latency experiment"
	@echo "--------------------------------"
	@go test tests/pod-network-latency_test.go -v -count=1

.PHONY: pod-network-loss
pod-network-loss:

	@echo "-------------------------------"
	@echo "Running pod-network-loss experiment"
	@echo "--------------------------------"
	@go test tests/pod-network-loss_test.go -v -count=1


.PHONY: pod-network-corruption
pod-network-corruption:

	@echo "-------------------------------"
	@echo "Running pod-network-corruption experiment"
	@echo "--------------------------------"
	@go test tests/pod-network-corruption_test.go -v -count=1

.PHONY: pod-cpu-hog
pod-cpu-hog:

	@echo "-------------------------------"
	@echo "Running pod-cpu-hog experiment"
	@echo "--------------------------------"
	@go test tests/pod-cpu-hog_test.go -v -count=1

.PHONY: node-cpu-hog
node-cpu-hog:

	@echo "-------------------------------"
	@echo "Running node-cpu-hog experiment"
	@echo "--------------------------------"
	@go test tests/node-cpu-hog_test.go -v -count=1

.PHONY: node-drain
node-drain:

	@echo "---------------------------------"
	@echo "Running node-drain experiment"
	@echo "---------------------------------"
	@go test tests/node-drain_test.go -v -count=1

.PHONY: disk-fill
disk-fill:

	@echo "--------------------------------"
	@echo "Running disk-fill experiment"
	@echo "--------------------------------"
	@go test tests/disk-fill_test.go -v -count=1

.PHONY: node-memory-hog
node-memory-hog:

	@echo "----------------------------------"
	@echo "Running node-memory-hog experiment"
	@echo "----------------------------------"
	@go test tests/node-memory-hog_test.go -v -count=1

.PHONY: pod-memory-hog
pod-memory-hog:

	@echo "---------------------------------"
	@echo "Running pod-memory-hog experiment"
	@echo "---------------------------------"
	@go test tests/pod-memory-hog_test.go -v -count=1	

.PHONY:  operator-reconcile-resiliency-check
 operator-reconcile-resiliency-check:

	@echo "--------------------------------------------"
	@echo "Running  Operator Reconcile Resiliency Check"
	@echo "--------------------------------------------"
	@go test tests/reconcile-resiliency_test.go -v -count=1	

.PHONY: admin-mode-check
admin-mode-check:

	@echo "------------------------"
	@echo "Running Admin Mode Check"
	@echo "------------------------"
	@go test tests/admin-mode_test.go -v -count=1	

.PHONY: app-cleanup
app-cleanup:

	@echo "--------------------"
	@echo "Deleting litmus"
	@echo "--------------------"
	@go test tests/litmus-cleanup_test.go -v -count=1
