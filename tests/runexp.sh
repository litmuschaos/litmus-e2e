#!/bin/bash

go test openebs-pool-container-failure_test.go -v -count=1

go test openebs-pool-pod-failure_test.go -v -count=1 -timeout=20m

go test openebs-target-network-delay_test.go -v -count=1

go test openebs-target-network-loss_test.go -v -count=1

go test openebs-target-pod-failure_test.go -v -count=1

go test openebs-target-container-failure_test.go -v -count=1

kubectl delete chaosengine -n litmus --all

kubectl delete chaosexperiment -n litmus --all
