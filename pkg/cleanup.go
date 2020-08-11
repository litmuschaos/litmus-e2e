package pkg

import (
	"bytes"
	"fmt"
	"os/exec"

	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	"k8s.io/klog"
)

// Cleanup will delete the chaosengine and chaosexperiment in all namespaces
func Cleanup() error {
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("kubectl", "delete", "chaosexperiment,chaosresult,chaosengine", "--all", "--all-namespaces")
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Wrapf(err, "Fail to delete litmus components, due to:%v", err)
	}

	return nil
}

// ChaosAbort will abort the execution of chaosexperiment
func ChaosAbort(testsDetails *types.TestDetails) error {
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("bash", "-c", `kubectl patch chaosengine `+testsDetails.EngineName+` -n `+testsDetails.ChaosNamespace+` --type merge --patch '{"spec":{"engineState":"stop"}}'`)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Wrapf(err, "Fail to abort the Chaos, due to:%v", err)

	}
	klog.Info("[Abort]: Chaos Experiment Aborted !!!")

	return nil
}
