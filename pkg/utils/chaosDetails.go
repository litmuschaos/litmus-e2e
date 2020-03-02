package utils

import (
	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

//Get the value of total chaos duration from the engine
func GetTotalChaosDurationFromEngine(engineName string, expName string, Clientset *chaosClient.LitmuschaosV1alpha1Client) (string, error) {

	engineSpec, err := Clientset.ChaosEngines(chaosTypes.ChaosNamespace).Get(engineName, metav1.GetOptions{})
	if err != nil {
		return chaosTypes.ChaosDuration, errors.Wrapf(err, "Unable to get ChaosEngine Resource in namespace: %v", chaosTypes.ChaosNamespace)
	}

	envList := engineSpec.Spec.Experiments
	for i := range envList {
		if envList[i].Name == expName {
			keyValue := envList[i].Spec.Components.ENV
			for j := range keyValue {
				if keyValue[j].Name == "TOTAL_CHAOS_DURATION" {
					chaosTypes.ChaosDuration = keyValue[j].Value
				}

			}
		}
	}
	return chaosTypes.ChaosDuration, nil
}

//Get the total chaos duration from experiment
func GetTotalChaosDurationFromExperiment(expName string, Clientset *chaosClient.LitmuschaosV1alpha1Client) (string, error) {

	experimentSpec, err := Clientset.ChaosExperiments(chaosTypes.ChaosNamespace).Get(expName, metav1.GetOptions{})
	if err != nil {
		return chaosTypes.ChaosDuration, errors.Wrapf(err, "Unable to get ChaosExperiment Resource in namespace: %v", chaosTypes.ChaosNamespace)
	}

	envList := experimentSpec.Spec.Definition.ENVList
	for j := range envList {
		if envList[j].Name == "TOTAL_CHAOS_DURATION" {
			chaosTypes.ChaosDuration = envList[j].Value
		}

	}
	return chaosTypes.ChaosDuration, nil
}
