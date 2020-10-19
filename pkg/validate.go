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

// ValidateResourceChaos will validate the actual cpu injection on the application pod
// It will compare the cpu usage before and after chaos
func ValidateResourceChaos(validation bool, resourceName, namespace, expName string) error {

	var cpuUsage int
	var memoryUsage int

	// waiting for chaos to progress
	klog.Info("[Wait]: Waiting for chaos to progress...")
	time.Sleep(60 * time.Second)

	switch expName {

	case "pod-cpu-hog":
		cpuUsage, err = GetCPUUsage(validation, resourceName, namespace, "pod")
		if err != nil {
			return errors.Errorf("fail to get the cpu usage after chaos err: %v", err)
		}
		klog.Infof("[CPU]: The CPU usage of app pod after chaos is: %vm", cpuUsage)
		// for default cpu spike of half core
		if cpuUsage < 500 {
			return errors.Errorf("Cpu chaos validation failed, the cpu usage after chaos is %v", cpuUsage)
		}
	case "node-cpu-hog":
		cpuUsage, err = GetCPUUsage(validation, resourceName, namespace, "node")
		if err != nil {
			return errors.Errorf("fail to get the cpu usage after chaos err: %v", err)
		}
		klog.Infof("[CPU]: The CPU usage of app node after chaos is: %vm", cpuUsage)

		// the default cpu spike depends on node capacity
		// assuming it to be 900m in this case
		if cpuUsage < 900 {
			return errors.Errorf("Cpu chaos validation failed, the cpu usage after chaos is %v", cpuUsage)
		}
	case "pod-memory-hog":

		memoryUsage, err = GetMemoryUsage(validation, resourceName, namespace, "pod")
		if err != nil {
			return errors.Errorf("fail to get the memory usage after chaos err: %v", err)
		}
		klog.Infof("[Memory]: The Memory usage of app pod after chaos is: %vMi", memoryUsage)
		// for default memory spike of 500Mi
		if memoryUsage < 450 {
			return errors.Errorf("Memory chaos validation failed, the memory usage after chaos is %v", memoryUsage)
		}

	case "node-memory-hog":

		memoryUsage, err = GetMemoryUsage(validation, resourceName, namespace, "node")
		if err != nil {
			return errors.Errorf("fail to get the memory usage after chaos err: %v", err)
		}
		klog.Infof("[Memory]: The Memory usage of app node after chaos is: %vMi", memoryUsage)
		// for default memory spike of 90%
		// assuming 90% of memory spike will be > 800Mi
		if memoryUsage < 800 {
			return errors.Errorf("Memory chaos validation failed, the memory usage after chaos is %v", memoryUsage)
		}

	default:
		return errors.Errorf("invalid experiment name for resource chaos")
	}

	return nil
}
