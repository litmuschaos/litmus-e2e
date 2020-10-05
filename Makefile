# Makefile for building litmus-e2e
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

TESTPATH ?= /home/udit1/go/src/github.com/litmuschaos/litmus-e2e

.PHONY: install-portal
install-portal:

	@echo "-----------"
	@echo "Installing Litmus-Portal"
	@echo "-----------"
	@sshpass -p ${portal_pass} ssh -o StrictHostKeyChecking=no ${portal_user}@${litmus_ip} -p ${port} "chmod 755 $(TESTPATH)/k8s_scripts/LitmusInstall.sh"
	@sshpass -p ${portal_pass} ssh -o StrictHostKeyChecking=no ${portal_user}@${litmus_ip} -p ${port} "$(TESTPATH)/k8s_scripts/LitmusInstall.sh"

.PHONY: cypress-setup
cypress-setup:

	@echo "-----------"
	@echo "Warming up the cached dependencies of Cypress."
	@echo "-----------"
	cd CypressE2E && npm ci --prefer-offline

.PHONY: pre-test-setup
pre-test-setup:

	@echo "-----------"
	@echo "Started Pre-test-setup"
	@echo "Testing of Login system, welcome-modal functionality and creation of workflow will be done here."
	@echo "-----------"
	cd CypressE2E && CYPRESS_BASE_URL=http://${FRONTEND_IP}:9091/ npm run BasicSetup_Tests

.PHONY: routes-check
routes-check:

	@echo "-----------"
	@echo "Started Routes Testing"
	@echo "Testing of all routes before and after login will be done here."
	@echo "-----------"
	cd CypressE2E && CYPRESS_BASE_URL=http://${FRONTEND_IP}:9091/ npm run Routes_Tests

.PHONY: account-settings-check
account-settings-check:

	@echo "-----------"
	@echo "Started Account-Settings Tests"
	@echo "Testing user-management,teaming and user details will be done here."
	@echo "-----------"
	cd CypressE2E && CYPRESS_BASE_URL=http://${FRONTEND_IP}:9091/ npm run AccountSettings_Tests

.PHONY: browse-workflow-check
browse-workflow-check:

	@echo "-----------"
	@echo "Started Browse-Tables Tests"
	@echo "Testing of functionality of browse-workflow, browse-schedules and browse-templates tables will be done here."
	@echo "-----------"
	cd CypressE2E && CYPRESS_BASE_URL=http://${FRONTEND_IP}:9091/ npm run BrowseWorkflow_Tests

.PHONY: community-page-check
community-page-check:

	@echo "-----------"
	@echo "Started Community page tests."
	@echo "Testing of community page data will be done here."
	@echo "-----------"
	cd CypressE2E && CYPRESS_BASE_URL=http://${FRONTEND_IP}:9091/ npm run Community_Tests

.PHONY: uninstall-portal
uninstall-portal:

	@echo "-----------"
	@echo "Uninstalling Litmus-Portal"
	@echo "-----------"
	@sshpass -p ${portal_pass} ssh -o StrictHostKeyChecking=no ${portal_user}@${litmus_ip} -p ${port} -tt \
	 "chmod 755 $(TESTPATH)/k8s_scripts/LitmusUninstall.sh"
	@sshpass -p ${portal_pass} ssh -o StrictHostKeyChecking=no ${portal_user}@${litmus_ip} -p ${port} -tt \
	 "$(TESTPATH)/k8s_scripts/LitmusUninstall.sh"