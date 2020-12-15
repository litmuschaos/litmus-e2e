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

//InstallGoRbac installs and configure rbac for running go based chaos
func InstallGoRbac(testsDetails *types.TestDetails, rbacNamespace string) error {

	//Fetch RBAC file
	var out bytes.Buffer
	var stderr bytes.Buffer
	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.RbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: default", "namespace: "+rbacNamespace)
	if err != nil {
		return errors.Errorf("Fail to Modify rbac file, due to %v", err)
	}
	//Creating rbac
	cmd := exec.Command("kubectl", "apply", "-f", "/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "-n", rbacNamespace)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		errors.Errorf("Fail to create the rbac file, due to {%v}", err)
	}
	klog.Infof("[RBAC]: " + out.String())
	klog.Info("[RBAC]: Rbac installed successfully !!!")

	return nil
}

//InstallGoChaosExperiment installs the given go based chaos experiment
func InstallGoChaosExperiment(testsDetails *types.TestDetails, experimentNamespace string) error {

	// Fetch Chaos Experiment
	var out bytes.Buffer
	var stderr bytes.Buffer
	if err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", testsDetails.ExperimentPath); err != nil {
		return errors.Errorf("Fail to fetch the experiment file, due to %v", err)
	}
	// Modify the spec of experiemnt file
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "image: \"litmuschaos/go-runner:latest\"", "image: "+testsDetails.GoExperimentImage); err != nil {
		return errors.Errorf("Fail to Update the experiment file, due to %v", err)

	}
	if testsDetails.TargetPod != "" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "TARGET_PODS", "value: ''", "value: '"+testsDetails.TargetPod+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	cmd := exec.Command("kubectl", "apply", "-f", "/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "-n", experimentNamespace)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Fail to create the experiment file, due to {%v}", err)
	}
	klog.Infof("[ChaosExperiment]: " + out.String())
	klog.Info("[ChaosExperiment]: Chaos Experiment created successfully with image: " + testsDetails.GoExperimentImage + " !!!")

	return nil
}

//InstallGoChaosEngine installs the given go based chaos engine
func InstallGoChaosEngine(testsDetails *types.TestDetails, engineNamespace string) error {

	// Fetch Chaos Engine
	var out bytes.Buffer
	var stderr bytes.Buffer
	if err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", testsDetails.EnginePath); err != nil {
		return errors.Errorf("Fail to fetch the engine file, due to %v", err)
	}
	// Add imagePullPolicy of chaos-runner to Always
	if err = AddAfterMatch(testsDetails.ExperimentName+"-ce.yaml", "jobCleanUpPolicy", "  components:\n    runner:\n      imagePullPolicy: Always"); err != nil {
		return errors.Errorf("Fail to add a new line due to %v", err)
	}
	// Modify the spec of engine file
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "name: nginx-chaos", "name: "+testsDetails.EngineName+""); err != nil {
		if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "name: nginx-network-chaos", "name: "+testsDetails.EngineName+""); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "namespace: default", "namespace: "+engineNamespace+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if testsDetails.AppNS != "" && testsDetails.AppLabel != "" {
		if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "appns: 'default'", "appns: "+testsDetails.AppNS+""); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
		if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "applabel: 'app=nginx'", "applabel: "+testsDetails.AppLabel+""); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "chaosServiceAccount: "+testsDetails.ExperimentName+"-sa", "chaosServiceAccount: "+testsDetails.ChaosServiceAccount+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "name: "+testsDetails.ExperimentName+"", "name: "+testsDetails.NewExperimentName+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "jobCleanUpPolicy: 'delete'", "jobCleanUpPolicy: "+testsDetails.JobCleanUpPolicy+""); err != nil {
		return errors.Errorf("Fail to Update the engine file, due to %v", err)
	}
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "annotationCheck: 'true'", "annotationCheck: '"+testsDetails.AnnotationCheck+"'"); err != nil {
		if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "annotationCheck: 'false'", "annotationCheck: '"+testsDetails.AnnotationCheck+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	if testsDetails.ApplicationNodeName != "" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "TARGET_NODE", "value: 'node-01'", "value: '"+testsDetails.ApplicationNodeName+"'"); err != nil {
			if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "TARGET_NODES", "value: 'node-01'", "value: '"+testsDetails.ApplicationNodeName+"'"); err != nil {
				return errors.Errorf("Fail to Update the engine file, due to %v", err)
			}
		}
		if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "kubernetes.io/hostname: 'node02'", "kubernetes.io/hostname: '"+testsDetails.NodeSelectorName+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	cmd := exec.Command("kubectl", "apply", "-f", "/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "-n", engineNamespace)
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

//InstallLitmus installs the latest version of litmus
func InstallLitmus(testsDetails *types.TestDetails) error {
	var out bytes.Buffer
	var stderr bytes.Buffer
	klog.Info("Installing Litmus ...")
	if err := DownloadFile("install-litmus.yaml", testsDetails.InstallLitmus); err != nil {
		return errors.Errorf("Fail to fetch litmus operator file, due to %v", err)
	}
	klog.Info("Updating ChaosOperator Image ...")
	if err := EditFile("install-litmus.yaml", "image: litmuschaos/chaos-operator:latest", "image: "+testsDetails.OperatorImage); err != nil {
		return errors.Errorf("Unable to update operator image, due to %v", err)

	}
	if err = EditKeyValue("install-litmus.yaml", "  - chaos-operator", "imagePullPolicy: Always", "imagePullPolicy: "+testsDetails.ImagePullPolicy); err != nil {
		return errors.Errorf("Unable to update image pull policy, due to %v", err)
	}
	klog.Info("Updating Chaos Runner Image ...")
	if err := EditKeyValue("install-litmus.yaml", "CHAOS_RUNNER_IMAGE", "value: \"litmuschaos/chaos-runner:latest\"", "value: '"+testsDetails.RunnerImage+"'"); err != nil {
		return errors.Errorf("Unable to update runner image, due to %v", err)
	}
	cmd := exec.Command("kubectl", "apply", "-f", "install-litmus.yaml")
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Fail to create the installation file, due to {%v}", err)
	}
	klog.Infof("Result: " + out.String())

	klog.Info("Litmus installed successfully !!!")

	return nil
}

//InstallAdminRbac installs admin rbac to run chaos
func InstallAdminRbac(testsDetails *types.TestDetails) error {

	//Fetch RBAC file
	var out bytes.Buffer
	var stderr bytes.Buffer
	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.AdminRbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: litmus", "namespace: "+testsDetails.ChaosNamespace)
	if err != nil {
		return errors.Errorf("Fail to Modify admin rbac file, due to %v", err)
	}
	//Creating admin rbac
	cmd := exec.Command("kubectl", "apply", "-f", "/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "-n", testsDetails.ChaosNamespace)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
		klog.Infof("Error: %v", err)
		return errors.Errorf("Fail to create the admin rbac file, due to {%v}", err)
	}
	klog.Infof("[RBAC]: " + out.String())
	klog.Info("[RBAC]: Rbac installed successfully !!!")

	return nil
}
