package pkg

import (
	"strconv"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
)

//InstallGoRbac installs and configure rbac for running go based chaos
func InstallGoRbac(testsDetails *types.TestDetails, rbacNamespace string) error {

	//Fetch RBAC file
	err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", testsDetails.RbacPath)
	if err != nil {
		return errors.Errorf("Fail to fetch the rbac file, due to %v", err)
	}
	//Modify Namespace field of the RBAC
	if rbacNamespace != "" {
		err = EditFile("/tmp/"+testsDetails.ExperimentName+"-sa.yaml", "namespace: default", "namespace: "+rbacNamespace)
		if err != nil {
			return errors.Errorf("Fail to Modify rbac file, due to %v", err)
		}
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

//InstallGoChaosExperiment installs the given go based chaos experiment
func InstallGoChaosExperiment(testsDetails *types.TestDetails, experimentNamespace string) error {

	// Fetch Chaos Experiment
	if err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", testsDetails.ExperimentPath); err != nil {
		return errors.Errorf("Fail to fetch the experiment file, due to %v", err)
	}
	// Modify the spec of experiemnt file
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "image: \"litmuschaos/go-runner:latest\"", "image: "+testsDetails.GoExperimentImage); err != nil {
		return errors.Errorf("Fail to Update the experiment file, due to %v", err)
	}
	// Modify experiment imagePullPolicy
	if err = EditFile("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "imagePullPolicy: Always", "imagePullPolicy: "+testsDetails.ExperimentImagePullPolicy); err != nil {
		log.Info("Field imagePullPolicy not defined")
	}

	if testsDetails.Sequence != "" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "SEQUENCE", "value: 'parallel'", "value: '"+testsDetails.Sequence+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	if testsDetails.PodsAffectedPercentage != "" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "PODS_AFFECTED_PERC", "value: ''", "value: '"+testsDetails.PodsAffectedPercentage+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	if testsDetails.TargetPod != "" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "TARGET_PODS", "value: ''", "value: '"+testsDetails.TargetPod+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	// Modify Lib
	if testsDetails.Lib != "" {
		log.Info("[LIB]: LIB: " + testsDetails.Lib)
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "LIB", "value: 'litmus'", "value: '"+testsDetails.Lib+"'"); err != nil {
			return errors.Errorf("Fail to update the lib, due to %v", err)
		}
	}
	// Modify Lib image
	if testsDetails.LibImageCI != "" {
		log.Info("[LIB Image]: LIB image: " + testsDetails.LibImageCI + " !!!")
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-exp.yaml", "LIB_IMAGE", "value: '"+testsDetails.LibImageDefault+"'", "value: '"+testsDetails.LibImageCI+"'"); err != nil {
			return errors.Errorf("Fail to update the lib image, due to %v", err)
		}
	}
	log.Info("[Experiment]: Installing Experiment...")
	//Creating experiment
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-exp.yaml", "-n", experimentNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply experiment file, err: %v", err)
	}
	log.Info("[ChaosExperiment]: Experiment installed successfully !!!")
	log.Info("[Experiment Image]: Chaos Experiment created successfully with image: " + testsDetails.GoExperimentImage + " !!!")

	return nil
}

//InstallGoChaosEngine installs the given go based chaos engine
func InstallGoChaosEngine(testsDetails *types.TestDetails, engineNamespace string) error {

	// Fetch Chaos Engine
	if err = DownloadFile("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", testsDetails.EnginePath); err != nil {
		return errors.Errorf("Fail to fetch the engine file, due to %v", err)
	}
	// Add imagePullPolicy of chaos-runner to Always
	if err = AddAfterMatch("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "jobCleanUpPolicy", "  components:\n    runner:\n      imagePullPolicy: Always"); err != nil {
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
	if err = AddAfterMatch("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "engineState: 'active'", "  annotationCheck: '"+testsDetails.AnnotationCheck+"'"); err != nil {
		return errors.Errorf("Fail to Update the engine file, err: %v", err)
	}
	// for ec2-terminate instance
	if testsDetails.ExperimentName == "ec2-terminate" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "EC2_INSTANCE_ID", "value: ''", "value: '"+testsDetails.InstanceID+"'"); err != nil {
			return errors.Errorf("Fail to update the instance id engine file, due to %v", err)
		}
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "REGION", "value: ''", "value: '"+testsDetails.Region+"'"); err != nil {
			return errors.Errorf("Fail to update the region engine file, due to %v", err)
		}
	}
	// for experiments like pod network latency
	if testsDetails.NetworkLatency != "" {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "NETWORK_LATENCY", "value: '2000'", "value: '"+testsDetails.NetworkLatency+"'"); err != nil {
			return errors.Errorf("Fail to Update the engine file, due to %v", err)
		}
	}
	// for experiments like pod cpu and memory hog
	if testsDetails.ExperimentName == "pod-cpu-hog" {
		if err = AddAfterMatch("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "value: '60'", "\n            - name: CHAOS_KILL_COMMAND\n              value: "+testsDetails.CPUKillCommand+""); err != nil {
			return errors.Errorf("Failed to add the chaos kill command,due to %v", err)
		}
	} else if testsDetails.ExperimentName == "pod-memory-hog" {
		if err = AddAfterMatch("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "value: '60'", "\n            - name: CHAOS_KILL_COMMAND\n              value: "+testsDetails.MemoryKillCommand+""); err != nil {
			return errors.Errorf("Failed to add the chaos kill command,due to %v", err)
		}
	}
	// for experiments like disk-fill
	if testsDetails.FillPercentage != 80 {
		if err = EditKeyValue("/tmp/"+testsDetails.ExperimentName+"-ce.yaml", "FILL_PERCENTAGE", "value: '80'", "value: '"+strconv.Itoa(testsDetails.FillPercentage)+"'"); err != nil {
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

//InstallLitmus installs the latest version of litmus
func InstallLitmus(testsDetails *types.TestDetails) error {

	log.Info("Installing Litmus ...")
	if err := DownloadFile("install-litmus.yaml", testsDetails.InstallLitmus); err != nil {
		return errors.Errorf("Fail to fetch litmus operator file, due to %v", err)
	}
	log.Info("Updating ChaosOperator Image ...")
	if err := EditFile("install-litmus.yaml", "image: litmuschaos/chaos-operator:latest", "image: "+testsDetails.OperatorImage); err != nil {
		return errors.Errorf("Unable to update operator image, due to %v", err)

	}
	if err = EditKeyValue("install-litmus.yaml", "  - chaos-operator", "imagePullPolicy: Always", "imagePullPolicy: "+testsDetails.ImagePullPolicy); err != nil {
		return errors.Errorf("Unable to update image pull policy, due to %v", err)
	}
	log.Info("Updating Chaos Runner Image ...")
	if err := EditKeyValue("install-litmus.yaml", "CHAOS_RUNNER_IMAGE", "value: \"litmuschaos/chaos-runner:latest\"", "value: '"+testsDetails.RunnerImage+"'"); err != nil {
		return errors.Errorf("Unable to update runner image, due to %v", err)
	}
	//Creating engine
	command := []string{"apply", "-f", "install-litmus.yaml"}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply litmus installation file, err: %v", err)
	}
	log.Info("Litmus installed successfully !!!")

	return nil
}

//InstallAdminRbac installs admin rbac to run chaos
func InstallAdminRbac(testsDetails *types.TestDetails) error {

	//Fetch RBAC file

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
	log.Info("[Admin]: Installing Litmus in Administrator Mode")
	command := []string{"apply", "-f", "/tmp/" + testsDetails.ExperimentName + "-sa.yaml", "-n", testsDetails.ChaosNamespace}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("fail to apply admin rbac file, err: %v", err)
	}
	log.Info("[Admin]: Admin RBAC installed successfully !!!")

	return nil
}
