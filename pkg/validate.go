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

//ValidateTargetPodChaos will check if the chaos induced on target pod or not.
func ValidateTargetPodChaos(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	podList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return errors.Errorf("unable to list the target pod err: %v", err)
	}

	//Check if chaos occur on target pod or not
	for _, pod := range podList.Items {
		if pod.Name == testsDetails.TargetPod {
			return errors.Errorf("fail to induce chaos on target pod")
		}
	}
	klog.Info("[Validate]: Induced chaos on target pod successfully")
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
