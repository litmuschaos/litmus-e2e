package pkg

import (
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog"
)

//ChaosResultVerdict checks the chaos result verdict
func ChaosResultVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) (error, error) {

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return nil, errors.Errorf("Fail to get the chaosresult, due to %v", err)
	}
	klog.Infof("Chaos Result Verdict is: %v", chaosResult.Status.ExperimentStatus.Verdict)
	if string(chaosResult.Status.ExperimentStatus.Verdict) != "Pass" {
		return nil, errors.Errorf("Fail to get the chaosresult verdict as \"Pass\"")
	}

	return nil, nil
}

//ChaosEngineVerdict checks the chaosengine verdict
func ChaosEngineVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) (error, error) {

	time.Sleep(10 * time.Second)
	chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
	if err != nil {
		return nil, errors.Errorf("Fail to get the chaosengine, due to %v", err)
	}
	klog.Infof("Chaos Engine Verdict is: %v", chaosEngine.Status.Experiments[0].Verdict)

	if string(chaosEngine.Status.Experiments[0].Verdict) != "Pass" {
		return nil, errors.Errorf("Fail to get the chaosengine verdict as \"Pass\"")
	}

	return nil, nil
}
