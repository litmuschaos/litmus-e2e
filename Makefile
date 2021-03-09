# Makefile for building litmus-e2e
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

.PHONY: install-portal
install-portal:

	@echo "-----------"
	@echo "Installing Litmus-Portal"
	@echo "-----------"
	chmod 755 litmus/setup.sh
	./litmus/setup.sh

.PHONY: cypress-setup
cypress-setup:

	@echo "-----------"
	@echo "Warming up the cached dependencies of Cypress."
	@echo "-----------"
	cd Cypress && npm ci --prefer-offline

.PHONY: pre-test-setup
pre-test-setup:

	@echo "-----------"
	@echo "Started Pre-test-setup"
	@echo "Testing of Login system, welcome-modal functionality and creation of workflow will be done here."
	@echo "-----------"
	@echo $(URL)
	cd Cypress && CYPRESS_BASE_URL=$(URL) npm run BasicSetup_Tests

.PHONY: routes-check
routes-check:

	@echo "-----------"
	@echo "Started Routes Testing"
	@echo "Testing of all routes before and after login will be done here."
	@echo "-----------"
	cd Cypress && CYPRESS_BASE_URL=$(URL) npm run Routes_Tests

.PHONY: account-settings-check
account-settings-check:

	@echo "-----------"
	@echo "Started Account-Settings Tests"
	@echo "Testing user-management,teaming and user details will be done here."
	@echo "-----------"
	cd Cypress && CYPRESS_BASE_URL=$(URL) npm run AccountSettings_Tests

.PHONY: browse-workflow-check
browse-workflow-check:

	@echo "-----------"
	@echo "Started Browse-Tables Tests"
	@echo "Testing of functionality of browse-workflow, browse-schedules and browse-templates tables will be done here."
	@echo "-----------"
	cd Cypress && CYPRESS_BASE_URL=$(URL) npm run BrowseWorkflow_Tests

.PHONY: create-workflow-check
create-workflow-check:

	@echo "-----------"
	@echo "Started Schedule Workflow Tests"
	@echo "Testing of Workflow scheduling functionality"
	@echo "-----------"
	 cd Cypress && CYPRESS_BASE_URL=$(URL) npm run CreateWorkflow_Tests

.PHONY: community-page-check
community-page-check:

	@echo "-----------"
	@echo "Started Community page tests."
	@echo "Testing of community page data will be done here."
	@echo "-----------"
	cd Cypress && CYPRESS_BASE_URL=$(URL) npm run Community_Tests

.PHONY: e2e-metrics
e2e-metrics:

	@echo "----------------------------"
	@echo "Pipeline Coverage Percentage"
	@echo "----------------------------"
	bash ./metrics/e2e-metrics

.PHONY: pipeline-status-update
pipeline-status-update:

	@echo "------------------------"
	@echo "Updating Pipeline Status"
	@echo "------------------------"
	@go test tests/pipeline-update_test.go -v -count=1

.PHONY: uninstall-portal
uninstall-portal:

	@echo "-----------"
	@echo "Uninstalling Litmus-Portal"
	@echo "-----------"
	chmod 755 litmus/cleanup.sh
	./litmus/cleanup.sh
