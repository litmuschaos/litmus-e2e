package pkg

import (
	"bytes"
	"fmt"
	"os/exec"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
)

// Cleanup will delete the chaosengine and chaosexperiment in all namespaces
func Cleanup() error {

	command := []string{"delete", "chaosexperiment,chaosresult,chaosengine", "--all", "--all-namespaces"}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to delete litmus components due to, err: %v", err)
	}

	return nil
}

// ChaosAbort will abort the execution of chaosexperiment
func ChaosAbort(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command("bash", "-c", `kubectl patch chaosengine `+testsDetails.EngineName+` -n `+testsDetails.ChaosNamespace+` --type merge --patch '{"spec":{"engineState":"stop"}}'`)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		log.Infof(fmt.Sprint(err) + ": " + stderr.String())
		log.Infof("Error: %v", err)
		return errors.Wrapf(err, "Failed to abort the Chaos due to:%v", err)

	}
	log.Info("[Abort]: Chaos Experiment Aborted !!!")
	return nil
}
