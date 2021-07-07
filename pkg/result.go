package pkg

import (
	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

//ChaosResultVerdict checks the chaos result verdict
func ChaosResultVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	if err = WaitForChaosResultCompletion(testsDetails, clients); err != nil {
		return errors.Errorf("engine state check failed, err %v", err)
	}

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Fail to get the chaosresult, due to %v", err)
	}
	log.Infof("Chaos Result Verdict is: %v", chaosResult.Status.ExperimentStatus.Verdict)
	if string(chaosResult.Status.ExperimentStatus.Verdict) != "Pass" {
		return errors.Errorf("Fail to get the chaosresult verdict as \"Pass\"")
	}

	return nil
}

//ChaosEngineVerdict checks the chaosengine verdict
func ChaosEngineVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	if err = WaitForEngineCompletion(testsDetails, clients); err != nil {
		return errors.Errorf("engine state check failed, err %v", err)
	}

	chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Fail to get the chaosengine, due to %v", err)
	}
	log.Infof("Chaos Engine Verdict is: %v", chaosEngine.Status.Experiments[0].Verdict)

	if string(chaosEngine.Status.Experiments[0].Verdict) != "Pass" {
		return errors.Errorf("Fail to get the chaosengine verdict as \"Pass\"")
	}

	return nil
}

func ChaosRunHistoryVerdict(testsDetails *types.TestDetails, clients environment.ClientSets, previousRunHistory v1alpha1.HistoryDetails) error {

	if err = WaitForChaosResultCompletion(testsDetails, clients); err != nil {
		return errors.Errorf("engine state check failed, err %v", err)
	}

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Fail to get the chaosresult, due to %v", err)
	}
	// log.Infof("Chaos Result Verdict is: %v", chaosResult.Status.ExperimentStatus.Verdict)
	// log.Infof("Chaos Run history is: %v", chaosResult.Status.History)
	// log.Infof("Previous Chaos Run history is: %v", previousRunHistory)
	if string(chaosResult.Status.ExperimentStatus.Verdict) == "Pass" {
		if chaosResult.Status.History.PassedRuns != previousRunHistory.PassedRuns+1 {
			return errors.Errorf("Fail to get the run history to update \"Passed Runs\"")
		}
	} else if string(chaosResult.Status.ExperimentStatus.Verdict) == "Fail" {
		if chaosResult.Status.History.FailedRuns != previousRunHistory.FailedRuns+1 {
			return errors.Errorf("Fail to get the run history to update \"Failed Runs\"")
		}
	} else if string(chaosResult.Status.ExperimentStatus.Verdict) == "Stopped" {
		if chaosResult.Status.History.StoppedRuns != previousRunHistory.StoppedRuns+1 {
			return errors.Errorf("Fail to get the run history to update \"Stopped Runs\"")
		}
	}

	return nil
}
