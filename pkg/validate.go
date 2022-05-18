package pkg

import (
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	litmusexec "github.com/litmuschaos/litmus-e2e/pkg/exec"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/litmuschaos/litmus-go/pkg/utils/retry"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

//ValidateTargetPodChaos will check if the chaos induced on target pod or not.
func ValidateTargetPodChaos(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	podList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return errors.Errorf("unable to list the target pod err: %v", err)
	}

	//Check if chaos occur on target pod or not
	for _, pod := range podList.Items {
		if pod.Name == testsDetails.TargetPod {
			return errors.Errorf("Failed to induce chaos on target pod")
		}
	}
	log.Info("[Validate]: Induced chaos on target pod successfully")
	return nil
}

// ValidateNetworkChaos checks the network interruption in the target pod specified
func ValidateNetworkChaos(testsDetails *types.TestDetails, TargetPodIP, HelperPod string, clients environment.ClientSets) error {

	//waiting for sometime for chaos to begin
	log.Infof("[Wait]: Waiting for 15s before %v validation ...", testsDetails.ExperimentName)
	time.Sleep(15 * time.Second)

	log.Infof("[Validation]: %v validation started", testsDetails.ExperimentName)
	// It will contains all the pod & container details required for exec command
	testsDetails.Duration = 10
	testsDetails.Delay = 3
	log.Info("[Wait]: Wating for ChaosResult Verdict updation")
	err := retry.
		Times(uint(testsDetails.Duration / testsDetails.Delay)).
		Wait(time.Duration(testsDetails.Delay) * time.Second).
		Try(func(attempt uint) error {
			execCommandDetails := litmusexec.PodDetails{}
			command := append([]string{"/bin/sh", "-c"}, "ping -c5 "+TargetPodIP+"")
			litmusexec.SetExecCommandAttributes(&execCommandDetails, HelperPod, "nginx", testsDetails.AppNS)
			response, err := litmusexec.Exec(&execCommandDetails, clients, command)
			if err != nil {
				log.Infof("[Validation]: Ping response is: %v", response)
				return nil
			}
			log.Infof("[Validation]: Ping response is: %v", response)
			return errors.Errorf("network is not interrupted")

		})

	return err
}

//ValidateNodeName validates a given target node name with the target node name present in the chaos result
func ValidateNodeName(nodeName string, clients environment.ClientSets, testsDetails *types.TestDetails) error {

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Failed to get the chaosresult due to %v", err)
	}

	for _, target := range chaosResult.Status.History.Targets {
		if target.Name == nodeName {
			return nil
		}
	}

	return errors.Errorf("failed to inject chaos in the target node")
}
