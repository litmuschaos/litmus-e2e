package pkg

import (
	"bytes"
	"fmt"
	"os/exec"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	"k8s.io/klog"
)

var (
	err error
)

//InstallAnsibleRbac installs and configure rbac for running ansible based chaos
func InstallAnsibleRbac(testsDetails *types.TestDetails, rbacNamespace string) error {

	//Fetch RBAC file
	var out bytes.Buffer
	var stderr bytes.Buffer
	err = DownloadFile(testsDetails.ExperimentName+"-sa.yaml", testsDetails.AnsibleRbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile(testsDetails.ExperimentName+"-sa.yaml", "namespace: default", "namespace: "+rbacNamespace)
	if err != nil {
		return errors.Errorf("Fail to Modify rbac file, due to %v", err)
	}
	//Creating rbac
	cmd := exec.Command("kubectl", "apply", "-f", testsDetails.ExperimentName+"-sa.yaml", "-n", rbacNamespace)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Fail to create the rbac file, due to {%v}", err)
	}
	klog.Infof("[RBAC]: " + out.String())
	klog.Info("[RBAC]: Rbac installed successfully !!!")

	return nil
}

//InstallAnsibleChaosExperiment installs the given ansible based chaos experiment
func InstallAnsibleChaosExperiment(testsDetails *types.TestDetails, experimentNamespace string) error {

	// Fetch Chaos Experiment
	var out bytes.Buffer
	var stderr bytes.Buffer
	if err = DownloadFile(testsDetails.ExperimentName+"-exp.yaml", testsDetails.AnsibleExperimentPath); err != nil {
		return errors.Errorf("Fail to fetch the experiment file, due to %v", err)
	}
	// Modify the spec of experiemnt file
	if err = EditFile(testsDetails.ExperimentName+"-exp.yaml", "image: \"litmuschaos/ansible-runner:latest\"", "image: "+testsDetails.AnsibleExperimentImage); err != nil {
		return errors.Errorf("Fail to Update the experiment file, due to %v", err)

	}
	cmd := exec.Command("kubectl", "apply", "-f", testsDetails.ExperimentName+"-exp.yaml", "-n", experimentNamespace)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Fail to create the experiment file, due to {%v}", err)
	}
	klog.Infof("[ChaosExperiment]: " + out.String())
	klog.Info("[ChaosExperiment]: Chaos Experiment created successfully with image: " + testsDetails.AnsibleExperimentImage + " !!!")

	return nil
}

//InstallAnsibleChaosEngine installs the given ansible based chaos engine
func InstallAnsibleChaosEngine(testsDetails *types.TestDetails, engineNamespace string) error {

	// Fetch Chaos Engine
	var out bytes.Buffer
	var stderr bytes.Buffer
	if err = DownloadFile(testsDetails.ExperimentName+"-ce.yaml", testsDetails.AnsibleEnginePath); err != nil {
		return errors.Errorf("Fail to fetch the engine file, due to %v", err)
	}
	// Modify the spec of engine file
	if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "name: nginx-chaos", "name: "+testsDetails.EngineName+""); err != nil {
		if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "name: nginx-network-chaos", "name: "+testsDetails.EngineName+""); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "namespace: default", "namespace: "+engineNamespace+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "appns: 'default'", "appns: "+testsDetails.AppNS+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "applabel: 'app=nginx'", "applabel: "+testsDetails.AppLabel+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "jobCleanUpPolicy: 'delete'", "jobCleanUpPolicy: "+testsDetails.JobCleanUpPolicy+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "annotationCheck: 'true'", "annotationCheck: '"+testsDetails.AnnotationCheck+"'"); err != nil {
		if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "annotationCheck: 'false'", "annotationCheck: '"+testsDetails.AnnotationCheck+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}

	if testsDetails.ApplicationNodeName != "" {
		if err = EditKeyValue(testsDetails.ExperimentName+"-ce.yaml", "APP_NODE", "value: 'node-01'", "value: '"+testsDetails.ApplicationNodeName+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
		if err = EditFile(testsDetails.ExperimentName+"-ce.yaml", "kubernetes.io/hostname: 'node02'", "kubernetes.io/hostname: '"+testsDetails.NodeSelectorName+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}

	cmd := exec.Command("kubectl", "apply", "-f", testsDetails.ExperimentName+"-ce.yaml", "-n", engineNamespace)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Fail to create the engine file, due to {%v}", err)
	}
	klog.Infof("[ChaosEngine]: " + out.String())
	time.Sleep(2 * time.Second)

	return nil
}
