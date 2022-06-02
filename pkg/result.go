package pkg

import (
	"github.com/litmuschaos/chaos-operator/pkg/apis/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

//ChaosResultVerdict checks the chaos result verdict
func ChaosResultVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	if err = WaitForChaosResultCompletion(testsDetails, clients); err != nil {
		return errors.Errorf("engine state check failed, err %v", err)
	}

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Failed to get the chaosresult due to %v", err)
	}
	log.Infof("Chaos Result Verdict is: %v", chaosResult.Status.ExperimentStatus.Verdict)
	if string(chaosResult.Status.ExperimentStatus.Verdict) != "Pass" {
		return errors.Errorf("Failed to get the chaosresult verdict as \"Pass\"")
	}

	return nil
}

//ChaosEngineVerdict checks the chaosengine verdict
func ChaosEngineVerdict(testsDetails *types.TestDetails, clients environment.ClientSets) error {

	if err = WaitForEngineStatus(testsDetails, clients, "completed"); err != nil {
		return errors.Errorf("engine state check failed, err %v", err)
	}

	chaosEngine, err := clients.LitmusClient.ChaosEngines(testsDetails.ChaosNamespace).Get(testsDetails.EngineName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Failed to get the chaosengine due to %v", err)
	}
	log.Infof("Chaos Engine Verdict is: %v", chaosEngine.Status.Experiments[0].Verdict)

	if string(chaosEngine.Status.Experiments[0].Verdict) != "Pass" {
		return errors.Errorf("Failed to get the chaosengine verdict as \"Pass\"")
	}

	return nil
}

// CheckRunHistoryUpdate checks the chaos result run history according to the ChaosResultVerdict
func CheckRunHistoryUpdate(testsDetails *types.TestDetails, clients environment.ClientSets, previousRunHistory v1alpha1.HistoryDetails) error {

	if err = WaitForChaosResultCompletion(testsDetails, clients); err != nil {
		return errors.Errorf("engine state check failed, err %v", err)
	}

	chaosResult, err := clients.LitmusClient.ChaosResults(testsDetails.ChaosNamespace).Get(testsDetails.EngineName+"-"+testsDetails.ExperimentName, metav1.GetOptions{})
	if err != nil {
		return errors.Errorf("Failed to get the chaosresult due to %v", err)
	}

	log.InfoWithValues("The chaos result previous run history is as followed", logrus.Fields{
		"Passed Runs":  previousRunHistory.PassedRuns,
		"Failed Runs":  previousRunHistory.FailedRuns,
		"Stopped Runs": previousRunHistory.StoppedRuns,
	})

	log.InfoWithValues("The chaos result current run history is as followed", logrus.Fields{
		"Passed Runs":  chaosResult.Status.History.PassedRuns,
		"Failed Runs":  chaosResult.Status.History.FailedRuns,
		"Stopped Runs": chaosResult.Status.History.StoppedRuns,
	})

	switch chaosResult.Status.ExperimentStatus.Verdict {
	case v1alpha1.ResultVerdictPassed:
		if chaosResult.Status.History.PassedRuns != previousRunHistory.PassedRuns+1 {
			return errors.Errorf("Failed to get the run history to update \"Passed Runs\"")
		}
	case v1alpha1.ResultVerdictFailed:
		if chaosResult.Status.History.FailedRuns != previousRunHistory.FailedRuns+1 {
			return errors.Errorf("Failed to get the run history to update \"Failed Runs\"")
		}
	case v1alpha1.ResultVerdictStopped:
		if chaosResult.Status.History.StoppedRuns != previousRunHistory.StoppedRuns+1 {
			return errors.Errorf("Failed to get the run history to update \"Stopped Runs\"")
		}
	}

	return nil
}
