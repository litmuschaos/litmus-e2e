# Makefile for building litmus-e2e

.PHONY: build-litmus
build-litmus:

	@echo "------------"
	@echo "Build Litmus"
	@echo "------------"
	@go test tests/bdds/install-litmus_test.go -v -count=1


.PHONY: build-openebs
build-openebs:

	@echo "-------------"
	@echo "Build OpenEBS"
	@echo "-------------"
	@go test tests/bdds/openebs-setup_test.go -v -count=1

.PHONY: app-deploy
app-deploy:

	@echo "-------------"
	@echo "Build OpenEBS"
	@echo "-------------"
	@go test tests/bdds/app-deploy_test.go -v -count=1

.PHONY: openebs-target-pod-failure
openebs-target-pod-failure:

	@echo "----------------------------------"
	@echo "Running OpenEBS Target Pod Failure"
	@echo "----------------------------------"
	@go test tests/bdds/openebs-target-pod-failure_test.go -v -count=1

.PHONY: openebs-pool-container-failure
openebs-pool-container-failure:

	@echo "--------------------------------------"
	@echo "Running OpenEBS Pool Container Failure"
	@echo "--------------------------------------"
	@go test tests/bdds/openebs-pool-container-failure_test.go -v -count=1

.PHONY: openebs-pool-pod-failure
openebs-pool-pod-failure:

	@echo "--------------------------------"
	@echo "Running OpenEBS Pool Pod Failure"
	@echo "--------------------------------"
	@go test tests/bdds/openebs-pool-pod-failure_test.go -v -count=1 -timeout=20m

.PHONY: openebs-target-container-failure
openebs-target-container-failure:

	@echo "----------------------------------------"
	@echo "Running OpenEBS Target Container Failure"
	@echo "----------------------------------------"
	@go test tests/bdds/openebs-target-container-failure_test.go -v -count=1

.PHONY: openebs-target-network-delay
openebs-target-network-delay:

	@echo "-------------------------------------"
	@echo "Running OpenEBS Target Network Deplay"
	@echo "-------------------------------------"
	@go test tests/bdds/openebs-target-network-delay_test.go -v -count=1


.PHONY: openebs-target-network-loss
openebs-target-network-loss:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@go test tests/bdds/openebs-target-network-loss_test.go -v -count=1


.PHONY: app-cleanup
app-cleanup:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@go test tests/bdds/app-cleanup_test.go -v -count=1


.PHONY: litmus-cleanup
litmus-cleanup:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@go test tests/bdds/litmus-cleanup_test.go -v -count=1


.PHONY: openebs-cleanup
openebs-cleanup:

	@echo "-----------------------------------"
	@echo "Running OpenEBS Target Network Loss"
	@echo "-----------------------------------"
	@go test tests/bdds/openebs-cleanup_test.go -v -count=1

