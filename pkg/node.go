package pkg

import (
	"bytes"
	"fmt"
	"os/exec"

	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	"k8s.io/klog"
)

// NodeCordon will cordon the given node
func NodeCordon(testsDetails *types.TestDetails) error {
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("kubectl", "cordon", testsDetails.ApplicationNodeName)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Unable to cordon application node")
	}
	klog.Infof("[NodeCordon]: " + out.String())

	return nil
}

// NodeUncordon will uncordon the given node
func NodeUncordon(testsDetails *types.TestDetails) error {
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("kubectl", "uncordon", testsDetails.ApplicationNodeName)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Unable to uncordon application node")
	}
	klog.Infof("[NodeUncordon]: " + out.String())

	return nil
}
