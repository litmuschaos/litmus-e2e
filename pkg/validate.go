package pkg

import (
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
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
