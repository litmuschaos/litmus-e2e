package pkg

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"

	"k8s.io/klog"
)

// ENVDetails contains the ENV details
type ENVDetails struct {
	ENV map[string]string
}

// Kubectl will run kubectl commands and print the output
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
	klog.Infof("%v", out.String())
	return nil
}

//PrepareChaos install all the Chaos resourses like rbac, experiment and engine
func PrepareChaos(testsDetails *types.TestDetails, chaosExperiment *v1alpha1.ChaosExperiment, chaosEngine *v1alpha1.ChaosEngine, clients environment.ClientSets, annotation bool) error {

	testsDetails.AnnotationCheck = strconv.FormatBool(annotation)

	//Installing RBAC for the experiment
	log.Info("[Install]: Installing RBAC")

	err = InstallGoRbac(testsDetails, testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Failed to install rbac due to {%v}", err)
	}

	//Installing Chaos Experiment
	log.Info("[Install]: Installing chaos experiment")
	err = InstallGoChaosExperiment(testsDetails, chaosExperiment, testsDetails.ChaosNamespace, clients)
	if err != nil {
		return errors.Errorf("Failed to install chaos experiment due to {%v}", err)
	}

	//Installing Chaos Engine
	log.Info("[Install]: Installing chaos engine")
	err = InstallGoChaosEngine(testsDetails, chaosEngine, testsDetails.ChaosNamespace, clients)
	if err != nil {
		return errors.Errorf("Failed to install chaosengine due to {%v}", err)
	}
	return nil
}

// SetEnv sets the env inside envDetails struct
func (envDetails *ENVDetails) SetEnv(key, value string) *ENVDetails {
	if value != "" {
		envDetails.ENV[key] = value
	}
	return envDetails
}
