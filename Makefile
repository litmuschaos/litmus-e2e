# Makefile for building litmus-e2e

.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@go test tests/install-litmus_test.go -v -count=1


.PHONY: build-openebs
build-openebs:

	@echo "-------------"
	@echo "Build OpenEBS"
	@echo "-------------"
	@go test tests/openebs-setup_test.go -v -count=1

.PHONY: app-deploy
app-deploy:

	@echo "---------------------"
	@echo "Deploying Application"
	@echo "---------------------"
	@go test tests/app-deploy_test.go -v -count=1

.PHONY: openebs-target-pod-failure
openebs-target-pod-failure:

	@echo "----------------------------------"
	@echo "Running OpenEBS Target Pod Failure"
	@echo "----------------------------------"
	@go test tests/openebs-target-pod-failure_test.go -v -count=1

.PHONY: openebs-pool-container-failure
openebs-pool-container-failure:

	@echo "--------------------------------------"
	@echo "Running OpenEBS Pool Container Failure"
	@echo "--------------------------------------"
	@go test tests/openebs-pool-container-failure_test.go -v -count=1

.PHONY: openebs-pool-pod-failure
openebs-pool-pod-failure:

	@echo "--------------------------------"
	@echo "Running OpenEBS Pool Pod Failure"
	@echo "--------------------------------"
	@go test tests/openebs-pool-pod-failure_test.go -v -count=1 -timeout=20m

.PHONY: openebs-target-container-failure
openebs-target-container-failure:

	@echo "----------------------------------------"
	@echo "Running OpenEBS Target Container Failure"
	@echo "----------------------------------------"
	@go test tests/openebs-target-container-failure_test.go -v -count=1

.PHONY: openebs-target-network-delay
openebs-target-network-delay:

	@echo "-------------------------------------"
	@echo "Running OpenEBS Target Network Delay"
	@echo "-------------------------------------"
	@go test tests/openebs-target-network-delay_test.go -v -count=1


.PHONY: openebs-target-network-loss
openebs-target-network-loss:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@go test tests/openebs-target-network-loss_test.go -v -count=1

.PHONY: openebs-control-plane-chaos
openebs-control-plane-chaos:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Control Plane Chaos"
	@echo "-----------------------------------"
	@go test tests/openebs-control-plane-chaos_test.go -v -count=1

.PHONY: app-cleanup
app-cleanup:

	@echo "-------------------"
	@echo "Application Cleanup"
	@echo "-------------------"
	@go test tests/app-cleanup_test.go -v -count=1


.PHONY: litmus-cleanup
litmus-cleanup:

	@echo "--------------"
	@echo "Litmus Cleanup"
	@echo "--------------"
	@go test tests/litmus-cleanup_test.go -v -count=1


.PHONY: openebs-cleanup
openebs-cleanup:

	@echo "---------------"
	@echo "OpenEBS Cleanup"
	@echo "---------------"
	@go test tests/openebs-cleanup_test.go -v -count=1

