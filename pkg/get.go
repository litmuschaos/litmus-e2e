package pkg

import (
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog"
)

// GetApplicationNode will give the node name of the application pod
func GetApplicationNode(testsDetails *types.TestDetails, clients environment.ClientSets) (error, error) {
	appPodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return nil, errors.Errorf("Unable to get the list of application pods, due to %v", err)
	}

	testsDetails.ApplicationNodeName = appPodList.Items[0].Spec.NodeName

	return nil, nil
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

	return PodList.Items[0].Name, PodList.Items[0].Status.PodIP, PodList.Items[1].Name, nil

}
