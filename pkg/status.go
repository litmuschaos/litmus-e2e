package pkg

import (
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/litmuschaos/litmus-go/pkg/utils/retry"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog"
)

//RunnerPodStatus will check the runner pod running state
func RunnerPodStatus(testsDetails *types.TestDetails, runnerNamespace string, clients environment.ClientSets) error {

	//Fetching the runner pod and Checking if it gets in Running state or not
	if err = CheckRunnerPodCreation(testsDetails.EngineName, runnerNamespace, clients); err != nil {
		return errors.Errorf("Failed to get the runner pod due to %v", err)
	}
	runner, err := clients.KubeClient.CoreV1().Pods(runnerNamespace).Get(testsDetails.EngineName+"-runner", metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Unable to get the runner pod due to %v", err)
	}
	for i := 0; i < 300; i++ {
		if string(runner.Status.Phase) != "Running" {
			time.Sleep(1 * time.Second)
			runner, err = clients.KubeClient.CoreV1().Pods(runnerNamespace).Get(testsDetails.EngineName+"-runner", metav1.GetOptions{})
			if err != nil || runner.Status.Phase == "Succeeded" || runner.Status.Phase == "" {
				return errors.Errorf("Failed to get the runner pod status after sleep due to %v", err)
			}
			log.Infof("The Runner pod is in %v State ", runner.Status.Phase)
		} else {
			break
		}
	}

	if runner.Status.Phase != "Running" {
		return errors.Errorf("Runner pod Failed to come in running state due to %v", err)
	}
	log.Info("[Status]: Runner pod is in Running state")

	return nil
}

// CheckRunnerPodCreation will check for the create of runner pod
func CheckRunnerPodCreation(engineName, runnerNS string, clients environment.ClientSets) error {
	err := retry.
		Times(uint(10 / 2)).
		Wait(time.Duration(2) * time.Second).
		Try(func(attempt uint) error {
			runner, err := clients.KubeClient.CoreV1().Pods(runnerNS).Get(engineName+"-runner", metav1.GetOptions{})
			if err != nil {
				return errors.Errorf("Unable to get the runner pod due to %v", err)
			}
			if runner.Name == "" {
				log.Info("waiting for runner pod creation")
				return errors.Errorf("runner pod is yet not created")
			}
			log.Infof("[Info]: Runner pod Name %v", runner.Name)

			return nil
		})
	return err
}

//DeploymentStatusCheck checks running status of deployment with deployment name and namespace
func DeploymentStatusCheck(testsDetails *types.TestDetails, deploymentName, deploymentNS string, clients environment.ClientSets) error {

	sampleApp, _ := clients.KubeClient.AppsV1().Deployments(deploymentNS).Get(deploymentName, metav1.GetOptions{})
	for count := 0; count < 20; count++ {
		if sampleApp.Status.UnavailableReplicas != 0 {
			log.Infof("Application is Creating, Currently Unavaliable Count is: %v ", sampleApp.Status.UnavailableReplicas)
			sampleApp, _ = clients.KubeClient.AppsV1().Deployments(deploymentNS).Get(deploymentName, metav1.GetOptions{})
			time.Sleep(5 * time.Second)

		} else {
			break
		}
		if count == 19 {
			return errors.Errorf("%v fails to get in Running state", deploymentName)
		}
	}
	return nil
}

//OperatorStatusCheck checks the running status of chaos operator
func OperatorStatusCheck(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	sampleApp, _ := clients.KubeClient.AppsV1().Deployments(testsDetails.ChaosNamespace).Get(testsDetails.OperatorName, metav1.GetOptions{})

	for count := 0; count < 20; count++ {
		if sampleApp.Status.UnavailableReplicas != 0 {
			log.Infof("Operator's Unavaliable Count is: %v", sampleApp.Status.UnavailableReplicas)
			sampleApp, _ = clients.KubeClient.AppsV1().Deployments(testsDetails.ChaosNamespace).Get(testsDetails.OperatorName, metav1.GetOptions{})
			time.Sleep(5 * time.Second)
			count++
		} else {
			break
		}
		if count == 19 {
			return errors.Errorf("%v fails to get in Running state", testsDetails.OperatorName)
		}
	}
	log.Info("[Status]: Operator is in Running state")
	return nil
}

//DeploymentCleanupCheck checks the termination of deployment
func DeploymentCleanupCheck(testsDetails *types.TestDetails, deploymentName string, clients environment.ClientSets) error {

	sampleApp, _ := clients.KubeClient.AppsV1().Deployments(testsDetails.AppNS).Get(deploymentName, metav1.GetOptions{})
	for count := 0; count < 20; count++ {
		if sampleApp.Status.AvailableReplicas != 0 {
			log.Infof("Application is Deleting, Currently Avaliable Count is: %v ", sampleApp.Status.AvailableReplicas)
			sampleApp, _ = clients.KubeClient.AppsV1().Deployments(testsDetails.AppNS).Get(deploymentName, metav1.GetOptions{})
			time.Sleep(5 * time.Second)

		} else {
			break
		}
		if count == 19 {
			return errors.Errorf("%v termination fails", deploymentName)
		}
	}
	log.Info("[Cleanup]: Application deleted successfully")
	return nil
}

//PodStatusCheck checks the pod running status
func PodStatusCheck(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	PodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return errors.Errorf("Failed to get the list of pods due to %v", err)
	}
	var flag = false
	for _, pod := range PodList.Items {
		if string(pod.Status.Phase) != "Running" {
			for count := 0; count < 20; count++ {
				PodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
				if err != nil {
					return errors.Errorf("Failed to get the list of pods due to %v", err)
				}
				for _, pod := range PodList.Items {
					if string(pod.Status.Phase) != "Running" {
						log.Infof("Currently, the experiment job pod is in %v State, Please Wait ...", pod.Status.Phase)
						time.Sleep(5 * time.Second)
					} else {
						flag = true
						break

					}
				}
				if flag {
					break
				}
				if count == 19 {
					return errors.Errorf("pod fails to come in running state due to %v", err)
				}
			}
		}
	}
	log.Info("[Status]: Pod is in Running state")

	return nil
}

// ChaosPodStatus will check the creation of chaos pod
func ChaosPodStatus(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	for count := 0; count < (testsDetails.Duration / testsDetails.Delay); count++ {

		chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
		if err != nil {
			return errors.Errorf("Failed to get the chaosengine %v err: %v", testsDetails.EngineName, err)
		}
		if len(chaosEngine.Status.Experiments) == 0 {
			time.Sleep(time.Duration(testsDetails.Delay) * time.Second)
			log.Info("[Status]: Experiment initializing")
			if count == ((testsDetails.Duration / testsDetails.Delay) - 1) {
				return errors.Errorf("Experiment pod Failed to initialise due to %v", err)
			}

		} else if chaosEngine.Status.Experiments[0].ExpPod == "" {
			time.Sleep(time.Duration(testsDetails.Delay) * time.Second)
			if count == ((testsDetails.Duration / testsDetails.Delay) - 1) {
				return errors.Errorf("Experiment pod fails to create due to %v", err)
			}
		} else if chaosEngine.Status.Experiments[0].Status != "Running" {
			time.Sleep(time.Duration(testsDetails.Delay) * time.Second)
			log.Infof("[Status]: Currently, the Chaos Pod is in %v state, Please Wait...", chaosEngine.Status.Experiments[0].Status)
			if count == ((testsDetails.Duration / testsDetails.Delay) - 1) {
				return errors.Errorf("Experiment pod fails to get in running state due to %v", err)
			}
		} else {
			break
		}
	}
	log.Info("[Status]: Chaos pod initiated successfully")
	return nil
}

//WaitForEngineStatus waits for engine state to get completed
func WaitForEngineStatus(testsDetails *types.TestDetails, clients environment.ClientSets, status string) error {
	err := retry.
		Times(uint(testsDetails.Duration / testsDetails.Delay)).
		Wait(time.Duration(testsDetails.Delay) * time.Second).
		Try(func(attempt uint) error {
			chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
			if err != nil {
				return errors.Errorf("Failed to get the chaosengine due to %v", err)
			}
			if string(chaosEngine.Status.EngineStatus) != status {
				log.Infof("Engine status is %v", chaosEngine.Status.EngineStatus)
				return errors.Errorf("Engine is not yet %v", status)
			}
			log.Infof("Engine status is %v", chaosEngine.Status.EngineStatus)

			return nil
		})

	return err
}

//WaitForRunnerCompletion waits for runner pod completion
func WaitForRunnerCompletion(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	err := retry.
		Times(uint(testsDetails.Duration / testsDetails.Delay)).
		Wait(time.Duration(testsDetails.Delay) * time.Second).
		Try(func(attempt uint) error {
			runner, err := clients.KubeClient.CoreV1().Pods(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-runner", metav1.GetOptions{})
			if err != nil {
				return errors.Errorf("Unable to get the runner pod due to %v", err)
			}

			if string(runner.Status.Phase) != "Succeeded" {
				log.Infof("Runner pod status is %v", runner.Status.Phase)
				return errors.Errorf("Runner pod is not yet completed")
			}
			log.Infof("Runner pod status is %v", runner.Status.Phase)

			return nil
		})

	return err
}

//WaitForChaosResultCompletion waits for chaosresult state to get completed
func WaitForChaosResultCompletion(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	err := retry.
		Times(uint(testsDetails.Duration / testsDetails.Delay)).
		Wait(time.Duration(testsDetails.Delay) * time.Second).
		Try(func(attempt uint) error {
			chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
			if err != nil {
				return errors.Errorf("Failed to get the chaosresult due to %v", err)
			}

			if string(chaosResult.Status.ExperimentStatus.Phase) != "Completed" {
				klog.Infof("ChaosResult status is %v", chaosResult.Status.ExperimentStatus.Phase)
				return errors.Errorf("ChaosResult is not yet completed")
			}
			klog.Infof("ChaosResult status is %v", chaosResult.Status.ExperimentStatus.Phase)

			return nil
		})

	return err
}
