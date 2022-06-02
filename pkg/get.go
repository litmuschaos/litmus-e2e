package pkg

import (
	"math/rand"
	"time"

	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/litmuschaos/litmus-go/pkg/utils/retry"
	"github.com/pkg/errors"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetApplicationNode will give the node name of the application pod
func GetApplicationNode(testsDetails *types.TestDetails, clients environment.ClientSets) error {
	appPodList, err := clients.KubeClient.CoreV1().Pods(testsDetails.AppNS).List(metav1.ListOptions{LabelSelector: testsDetails.AppLabel})
	if err != nil {
		return errors.Errorf("Unable to get the list of application pods due to %v", err)
	}

	testsDetails.ApplicationNodeName = appPodList.Items[0].Spec.NodeName

	return nil
}

//GetChaosEngineVerdict checks the chaosengine verdict
func GetChaosEngineVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) (string, error) {

	testsDetails.Duration = 30
	testsDetails.Delay = 1
	log.Info("[Wait]: Wating for ChaosEngine Verdict updation")
	if err := retry.
		Times(uint(testsDetails.Duration / testsDetails.Delay)).
		Wait(time.Duration(testsDetails.Delay) * time.Second).
		Try(func(attempt uint) error {
			chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
			if err != nil {
				return errors.Errorf("Failed to get the chaosengine due to %v", err)
			}

			if string(chaosEngine.Status.Experiments[0].Verdict) == "Awaited" {
				return errors.Errorf("Verdict of Chaos Engine is Awaited")
			}
			log.Infof("Chaos Engine Verdict is %v", chaosEngine.Status.Experiments[0].Verdict)

			return nil
		}); err != nil {
		return "", err
	}
	chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
	if err != nil {
		return "", errors.Errorf("Failed to get the chaosengine due to %v", err)
	}
	return string(chaosEngine.Status.Experiments[0].Verdict), err
}

//GetChaosResultVerdict checks the chaos result verdict
func GetChaosResultVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) (string, error) {

	testsDetails.Duration = 30
	testsDetails.Delay = 1
	log.Info("[Wait]: Wating for ChaosResult Verdict updation")
	if err := retry.
		Times(uint(testsDetails.Duration / testsDetails.Delay)).
		Wait(time.Duration(testsDetails.Delay) * time.Second).
		Try(func(attempt uint) error {
			chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
			if err != nil {
				return errors.Errorf("Failed to get the chaosresult due to %v", err)
			}

			if string(chaosResult.Status.ExperimentStatus.Verdict) == "Awaited" {
				return errors.Errorf("Verdict of Chaos Engine is Awaited")
			}
			log.Infof("Chaos Engine Verdict is %v", chaosResult.Status.ExperimentStatus.Verdict)

			return nil
		}); err != nil {
		return "", err
	}
	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return "", errors.Errorf("Failed to get the chaosresult due to %v", err)
	}
	return string(chaosResult.Status.ExperimentStatus.Verdict), err
}

//GetJobPod checks the job pod is present or not
func GetJobPod(testsDetails *types.TestDetails, jobNamespace string, clients environment.ClientSets) error {
	job, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + testsDetails.ExperimentName})
	if err != nil || int(len(job.Items)) == 0 {
		return errors.Errorf("failed to get the chaos jobs due to %v", err)
	}
	log.Info("[JOB]: The given job is present")
	return nil
}

// GetSelectorNode will return a node other than the application node selected for using in node selector in chaos engine spec
func GetSelectorNode(testsDetails *types.TestDetails, clients environment.ClientSets) (string, error) {
	nodes, err := clients.KubeClient.CoreV1().Nodes().List(metav1.ListOptions{})
	if err != nil || len(nodes.Items) == 0 {
		return "", errors.Errorf("Failed to get nodes due to %v", err)
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
		return "", "", "", errors.Errorf("Failed to get the podlist err: %v", err)
	}

	log.Infof("The target pod is %v with IP %v", PodList.Items[0].Name, PodList.Items[0].Status.PodIP)

	// returns the target pod and target pod ip along with helper pod to ping
	return PodList.Items[0].Name, PodList.Items[0].Status.PodIP, PodList.Items[1].Name, nil

}

// GetUID will return the uid from chaosengine
func GetUID(engineName, namespace string, clients environment.ClientSets) (string, error) {

	chaosEngine, err := clients.LitmusClient.ChaosEngines(namespace).Get(engineName, metav1.GetOptions{})
	if err != nil {
		return "", errors.Errorf("Failed to get the chaosengine %v err: %v", engineName, err)
	}
	return string(chaosEngine.UID), nil
}

// GetRunHistoryStatus fetches the chaos result run history
func GetRunHistoryStatus(testsDetails *types.TestDetails, clients environment.ClientSets) v1alpha1.HistoryDetails {
	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return v1alpha1.HistoryDetails{
			PassedRuns:  0,
			FailedRuns:  0,
			StoppedRuns: 0,
		}
	}
	return chaosResult.Status.History
}

//GetRandomNode returns a random node name
func GetRandomNode(clients environment.ClientSets) (*v1.Node, error) {
	nodes, err := clients.KubeClient.CoreV1().Nodes().List(metav1.ListOptions{})
	if err != nil || len(nodes.Items) == 0 {
		return nil, errors.Errorf("Failed to get nodes due to %v", err)
	}

	index := rand.Intn(len(nodes.Items))

	return &nodes.Items[index], nil
}
