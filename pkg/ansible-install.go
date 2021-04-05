package pkg

import (
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
)

var (
	err error
)

//InstallAnsibleRbac installs and configure rbac for running ansible based chaos
func InstallAnsibleRbac(testsDetails *types.TestDetails, rbacNamespace string) error {

	//Fetch RBAC file
	err = DownloadFile(testsDetails.ExperimentName+"-sa.yaml", testsDetails.AnsibleRbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile(testsDetails.ExperimentName+"-sa.yaml", "namespace: default", "namespace: "+rbacNamespace)
	if err != nil {
		return errors.Errorf("Fail to Modify rbac file, due to %v", err)
	}
	log.Info("[RBAC]: Installing RABC...")
	//Creating rbac
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-sa.yaml", "-n", rbacNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply rbac file, err: %v", err)
	}
	log.Info("[RBAC]: Rbac installed successfully !!!")

	return nil
}

//InstallAnsibleChaosExperiment installs the given ansible based chaos experiment
func InstallAnsibleChaosExperiment(testsDetails *types.TestDetails, experimentNamespace string) error {

	// Fetch Chaos Experiment
	if err = DownloadFile(testsDetails.ExperimentName+"-exp.yaml", testsDetails.AnsibleExperimentPath); err != nil {
		return errors.Errorf("Fail to fetch the experiment file, due to %v", err)
	}
	// Modify the spec of experiemnt file
	if err = EditFile(testsDetails.ExperimentName+"-exp.yaml", "image: \"litmuschaos/ansible-runner:latest\"", "image: "+testsDetails.AnsibleExperimentImage); err != nil {
		return errors.Errorf("Fail to Update the experiment file, due to %v", err)

	}
	log.Info("[Experiment]: Installing Experiment...")
	//Creating experiment
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-exp.yaml", "-n", experimentNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply experiment file, err: %v", err)
	}
	log.Info("[ChaosExperiment]: Experiment installed successfully !!!")
	log.Info("[ChaosExperiment]: Chaos Experiment created successfully with image: " + testsDetails.AnsibleExperimentImage + " !!!")

	return nil
}

//InstallAnsibleChaosEngine installs the given ansible based chaos engine
func InstallAnsibleChaosEngine(testsDetails *types.TestDetails, engineNamespace string) error {

	// Fetch Chaos Engine
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

	log.Info("[Engine]: Installing ChaosEngine...")
	//Creating engine
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-ce.yaml", "-n", engineNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply engine file, err: %v", err)
	}
	log.Info("[Engine]: ChaosEngine Installed Successfully !!!")
	time.Sleep(2 * time.Second)

	return nil
}
