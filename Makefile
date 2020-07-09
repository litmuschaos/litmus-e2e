# Makefile for building litmus-e2e
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

.PHONY: sample-test
sample-test:

	@echo "-----------"
	@echo "Sample Test"
	@echo "-----------"
	@sshpass -p ${portal_pass} ssh -o StrictHostKeyChecking=no ${portal_user}@${ip} -p ${port} -tt \
	 "echo "Hello World""

