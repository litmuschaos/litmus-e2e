package pkg

import (
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	litmusexec "github.com/litmuschaos/litmus-e2e/pkg/exec"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog"
)

//RunnerPodStatus will check the runner pod running state
func RunnerPodStatus(testsDetails *types.TestDetails, runnerNamespace string, clients environment.ClientSets) (error, error) {

	//Fetching the runner pod and Checking if it gets in Running state or not
	runner, err := clients.KubeClient.CoreV1().Pods(runnerNamespace).Get(testsDetails.EngineName+"-runner", metav1.GetOptions{})
	if err != nil {
		return nil, errors.Errorf("Unable to get the runner pod, due to %v", err)
	}
	klog.Infof("name : %v \n", runner.Name)
	//Running it for infinite time (say 3000 * 10)
	//The Gitlab job will quit if it takes more time than default time (10 min)
	for i := 0; i < 300; i++ {
		if string(runner.Status.Phase) != "Running" {
			time.Sleep(1 * time.Second)
			runner, err = clients.KubeClient.CoreV1().Pods(runnerNamespace).Get(testsDetails.EngineName+"-runner", metav1.GetOptions{})
			if err != nil || runner.Status.Phase == "Succeeded" || runner.Status.Phase == "" {
				return nil, errors.Errorf("Fail to get the runner pod status after sleep, due to %v", err)
			}
			klog.Infof("The Runner pod is in %v State \n", runner.Status.Phase)
		} else {
			break
		}
	}

	if runner.Status.Phase != "Running" {
		return nil, errors.Errorf("Runner pod fail to come in running state, due to %v", err)
	}
	klog.Info("Runner pod is in Running state")

	return nil, nil
}

//DeploymentStatusCheck checks running status of deployment with deployment name and namespace
func DeploymentStatusCheck(testsDetails *types.TestDetails, deploymentName, deploymentNS string, clients environment.ClientSets) error {

	sampleApp, _ := clients.KubeClient.AppsV1().Deployments(deploymentNS).Get(deploymentName, metav1.GetOptions{})
	for count := 0; count < 20; count++ {
		if sampleApp.Status.UnavailableReplicas != 0 {
			klog.Infof("Application is Creating, Currently Unavaliable Count is: %v \n", sampleApp.Status.UnavailableReplicas)
			sampleApp, _ = clients.KubeClient.AppsV1().Deployments(deploymentNS).Get(deploymentName, metav1.GetOptions{})
			time.Sleep(5 * time.Second)

		} else {
			break
		}
		if count == 19 {
			return errors.Errorf("%v fails to get in Running state, due to %v", deploymentName, err)
		}
	}
	return nil
}

//OperatorStatusCheck checks the running status of chaos operator
func OperatorStatusCheck(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	sampleApp, _ := clients.KubeClient.AppsV1().Deployments(testsDetails.ChaosNamespace).Get(testsDetails.OperatorName, metav1.GetOptions{})

	for count := 0; count < 20; count++ {
		if sampleApp.Status.UnavailableReplicas != 0 {
			klog.Infof("Operator's Unavaliable Count is: %v", sampleApp.Status.UnavailableReplicas)
			sampleApp, _ = clients.KubeClient.AppsV1().Deployments(testsDetails.ChaosNamespace).Get(testsDetails.OperatorName, metav1.GetOptions{})
			time.Sleep(5 * time.Second)
			count++
		} else {
			break
		}
		if count == 19 {
			return errors.Errorf("%v fails to get in Running state, due to %v", testsDetails.OperatorName, err)
		}
	}
	klog.Info("[Status]: Operator is in Running state")
	return nil
}

//DeploymentCleanupCheck checks the termination of deployment
func DeploymentCleanupCheck(testsDetails *types.TestDetails, deploymentName string, clients environment.ClientSets) error {

	sampleApp, _ := clients.KubeClient.AppsV1().Deployments(testsDetails.AppNS).Get(deploymentName, metav1.GetOptions{})
	for count := 0; count < 20; count++ {
		if sampleApp.Status.AvailableReplicas != 0 {
			klog.Infof("Application is Deleting, Currently Avaliable Count is: %v \n", sampleApp.Status.AvailableReplicas)
			sampleApp, _ = clients.KubeClient.AppsV1().Deployments(testsDetails.AppNS).Get(deploymentName, metav1.GetOptions{})
			time.Sleep(5 * time.Second)

		} else {
			break
		}
		if count == 19 {
			return errors.Errorf("%v termination fails, due to %v", deploymentName, err)
		}
	}
	klog.Info("[Cleanup]: Application deleted successfully")
	return nil
}

//PodStatusCheck checks the pod running status
func PodStatusCheck(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	PodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return errors.Errorf("fail to get the list of pods, due to %v", err)
	}
	var flag = false
	for _, pod := range PodList.Items {
		if string(pod.Status.Phase) != "Running" {
			for count := 0; count < 20; count++ {
				PodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
				if err != nil {
					return errors.Errorf("fail to get the list of pods, due to %v", err)
				}
				for _, pod := range PodList.Items {
					if string(pod.Status.Phase) != "Running" {
						klog.Infof("Currently, the experiment job pod is in %v State, Please Wait ...\n", pod.Status.Phase)
						time.Sleep(5 * time.Second)
					} else {
						flag = true
						break

					}
				}
				if flag == true {
					break
				}
				if count == 19 {
					return errors.Errorf("pod fails to come in running state, due to %v", err)
				}
			}
		}
	}
	klog.Info("[Status]: Pod is in Running state")

	return nil
}

// ChaosPodStatus will check the creation of chaos pod
func ChaosPodStatus(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	for count := 0; count < (testsDetails.Duration / testsDetails.Delay); count++ {

		chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
		if err != nil {
			return errors.Errorf("fail to get the chaosengine %v err: %v", testsDetails.EngineName, err)
		}
		if len(chaosEngine.Status.Experiments) == 0 {
			time.Sleep(time.Duration(testsDetails.Delay) * time.Second)
			klog.Info("[Status]: Experiment initializing")
			if count == ((testsDetails.Duration / testsDetails.Delay) - 1) {
				return errors.Errorf("Experiment pod fail to initialise, due to %v", err)
			}

		} else if len(chaosEngine.Status.Experiments[0].ExpPod) == 0 {
			time.Sleep(time.Duration(testsDetails.Delay) * time.Second)
			if count == ((testsDetails.Duration / testsDetails.Delay) - 1) {
				return errors.Errorf("Experiment pod fails to create, due to %v", err)
			}
		} else if chaosEngine.Status.Experiments[0].Status != "Running" {
			time.Sleep(time.Duration(testsDetails.Delay) * time.Second)
			klog.Infof("[Status]: Currently, the Chaos Pod is in %v state, Please Wait...", chaosEngine.Status.Experiments[0].Status)
			if count == ((testsDetails.Duration / testsDetails.Delay) - 1) {
				return errors.Errorf("Experiment pod fails to get in running state, due to %v", err)
			}
		} else {
			break
		}
	}
	klog.Info("[Status]: Chaos pod initiated successfully")
	return nil
}

// ValidateNetworkChaos checks the network interruption in the target pod specified
func ValidateNetworkChaos(testsDetails *types.TestDetails, TargetPodIP, HelperPod string, clients environment.ClientSets) error {

	//waiting for sometime for chaos to begin
	klog.Infof("[Wait]: Waiting for 15s before %v validation ...", testsDetails.ExperimentName)
	time.Sleep(15 * time.Second)

	klog.Infof("[Validation]: %v validation started", testsDetails.ExperimentName)
	// It will contains all the pod & container details required for exec command
	execCommandDetails := litmusexec.PodDetails{}
	command := append([]string{"/bin/sh", "-c"}, "ping -c1 "+TargetPodIP+"")
	litmusexec.SetExecCommandAttributes(&execCommandDetails, HelperPod, "nginx", testsDetails.AppNS)
	response, err := litmusexec.Exec(&execCommandDetails, clients, command)
	if err != nil {
		klog.Infof("[Validation]: Ping response is: %v", response)
	} else {
		klog.Infof("[Validation]: Ping response is: %v", response)
		return errors.Errorf("network is not interrupted")
	}
	return nil
}
