package pkg

import (
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
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

	chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
	if err != nil {
		return "", errors.Errorf("Fail to get the chaosengine, due to %v", err)
	}
	return string(chaosEngine.Status.Experiments[0].Verdict), nil
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
