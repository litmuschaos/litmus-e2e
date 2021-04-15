package pkg

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"

	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
)

func Kubectl(command ...string) error {

	var out, stderr bytes.Buffer

	cmd := exec.Command("kubectl", command...)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		log.Infof(fmt.Sprint(err) + ": " + stderr.String())
		log.Infof("Error: %v", err)
		return err
	}
	log.Infof("%v", out.String())
	return nil
}

func PrepareChaos(testsDetails *types.TestDetails, annotation bool) error {

	testsDetails.AnnotationCheck = strconv.FormatBool(annotation)
	//Installing RBAC for the experimen
	log.Info("[Install]: Installing RBAC")
	err = InstallGoRbac(testsDetails, testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Fail to install rbac, due to {%v}", err)
	}

	//Installing Chaos Experiment
	log.Info("[Install]: Installing chaos experiment")
	err = InstallGoChaosExperiment(testsDetails, testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Fail to install chaos experiment, due to {%v}", err)
	}

	//Installing Chaos Engine
	log.Info("[Install]: Installing chaos engine")
	err = InstallGoChaosEngine(testsDetails, testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Fail to install chaosengine, due to {%v}", err)
	}
	return nil
}
