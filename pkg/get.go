package pkg

import (
	"bytes"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog"
)

// GetApplicationNode will give the node name of the application pod
func GetApplicationNode(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	appPodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return errors.Errorf("Unable to get the list of application pods, due to %v", err)
	}
	testsDetails.ApplicationNodeName = appPodList.Items[0].Spec.NodeName
	return nil
}

//GetChaosEngineVerdict checks the chaosengine verdict
func GetChaosEngineVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) (string, error) {

	time.Sleep(10 * time.Second)
	chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
	if err != nil {
		return "", errors.Errorf("Fail to get the chaosengine, due to %v", err)
	}
	klog.Infof("[ChaosEngien]: Chaos Engine Verdict is: %v", chaosEngine.Status.Experiments[0].Verdict)
	return string(chaosEngine.Status.Experiments[0].Verdict), nil
}

//GetChaosResultVerdict checks the chaos result verdict
func GetChaosResultVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) (string, error) {

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return "", errors.Errorf("Fail to get the chaosresult, due to %v", err)
	}
	klog.Infof("[ChaosResult]: Chaos Result Verdict is: %v", chaosResult.Status.ExperimentStatus.Verdict)
	return string(chaosResult.Status.ExperimentStatus.Verdict), nil
}

//GetJobPod checks the job pod is present or not
func GetJobPod(testsDetails *types.TestDetails, jobNamespace string, clients environment.ClientSets) error {
	job, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + testsDetails.ExperimentName})
	if err != nil || int(len(job.Items)) == 0 {
		return errors.Errorf("failed to get the chaos jobs, due to %v", err)
	}
	klog.Info("[JOB]: The give job is present")
	return nil
}

// GetSelectorNode will return a node other than the application node selected for using in node selector in chaos engine spec
func GetSelectorNode(testsDetails *types.TestDetails, clients environment.ClientSets) (string, error) {
	nodes, err := clients.KubeClient.CoreV1().Nodes().List(metav1.ListOptions{})
	if err != nil || len(nodes.Items) == 0 {
		return "", errors.Errorf("Fail to get nodes, due to %v", err)
	}

	for _, node := range nodes.Items {
		if node.Name != testsDetails.ApplicationNodeName {
			return string(node.Name), nil
		}
	}
	return "", nil
}

// GetAppNameAndIP will return the first app name and its ip along with a helper pod to ping from the list of app pods
func GetAppNameAndIP(appLabel, appNS string, clients environment.ClientSets) (string, string, string, error) {

	PodList, err := clients.KubeClient.CoreV1().Pods(appNS).List(metav1.ListOptions{LabelSelector: appLabel})
	if err != nil || len(PodList.Items) == 0 {
		return "", "", "", errors.Errorf("fail to get the podlist err: %v", err)
	}

	klog.Infof("The target pod is %v with IP %v", PodList.Items[0].Name, PodList.Items[0].Status.PodIP)

	// returns the target pod and target pod ip along with helper pod to ping
	return PodList.Items[0].Name, PodList.Items[0].Status.PodIP, PodList.Items[1].Name, nil

}

// GetCPUUsage will return the CPU usage by pod or node depending upon resource type.
func GetCPUUsage(validation bool, resourceName, namespace, resourceType string) (int, error) {

	var out, stderr bytes.Buffer
	if validation == true {
		cmd := exec.Command("bash", "-c", `kubectl top `+resourceType+` `+resourceName+` -n `+namespace+` --no-headers | awk '{print$2}'`)
		cmd.Stdout = &out
		cmd.Stderr = &stderr
		err = cmd.Run()
		if err != nil {
			klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
			klog.Infof("Error: %v", err)
			return 0, errors.Errorf("Fail to get the cpu usage before chaos, due to {%v}", err)
		}
		output := strings.Trim(out.String(), "")
		cpu, _ := strconv.Atoi(strings.Split(output, "m")[0])
		return cpu, nil
	}
	klog.Info("[Skip]: CPU Chaos validation skiped")

	return 0, nil
}

// GetMemoryUsage will return the Memory usage by pod or node depending upon resource type.
func GetMemoryUsage(validation bool, resourceName, namespace, resourceType string) (int, error) {

	var out, stderr bytes.Buffer
	var col string
	// select the third or fouth row of top command output
	// according to the resource type.
	if resourceType == "node" {
		col = "4"
	} else {
		col = "3"
	}
	if validation == true {
		cmd := exec.Command("bash", "-c", `kubectl top `+resourceType+` `+resourceName+` -n `+namespace+` --no-headers | awk '{print$`+col+`}'`)
		cmd.Stdout = &out
		cmd.Stderr = &stderr
		err = cmd.Run()
		if err != nil {
			klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
			klog.Infof("Error: %v", err)
			return 0, errors.Errorf("Fail to get the memory usage before chaos, due to {%v}", err)
		}
		output := strings.Trim(out.String(), "")
		memory, _ := strconv.Atoi(strings.Split(output, "M")[0])
		return memory, nil
	}
	klog.Info("[Skip]: Memory Chaos validation skiped")

	return 0, nil
}
