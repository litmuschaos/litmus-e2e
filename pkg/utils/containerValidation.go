package utils

import (
	"reflect"

	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

// CompareContainerID here we are comparing the containerIDs before chaos and after chaos
// ContainerID before chaos has to be recorded in the BDD only and passed here as an argument
// In this function we are getting containerID after chaos and checking if it changed or not.
// If the containerID will change then it will return true else false value.
func CompareContainerID(containerIDBefore [9]string, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (bool, error) {
	var containerIDAfter [9]string
	containerCount := 0
	containerIDChanged := false
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	// Getting the list of pods with given label and namespace
	podList, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return false, err
	}
	// Iterating over all pods
	for _, pod := range podList.Items {
		//Iterating over all container in a pod
		for i := range pod.Status.ContainerStatuses {
			containerIDAfter[containerCount] = (pod.Status.ContainerStatuses[i].ContainerID)
			containerCount++
		}
	}
	for i := range containerIDBefore {
		if containerIDBefore[i] != containerIDAfter[i] {
			containerIDChanged = true
			break
		}
	}
	return containerIDChanged, nil
}

// In this function we are comparing the containerRestartCount before chaos and after chaos
// ContainerRestartCount before chaos has to be recorded in the form of map in BDD only and
// Passed as an argument here along with the container name.In this function we are getting
// containerRestartCount after chaos and checking if it is changed or not. If the restart
// count of given container is changed it will return false value.
func CompareContainerRestartCount(containerDetailsBefore map[string][]interface{}, containerName string, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (bool, error) {
	// Initializing a map using the built-in make() function
	containerDetailsAfter := make(map[string][]interface{})
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	// Getting the list of pods with given label and namespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return true, err
	}
	// Iterating over all pods
	for _, podList := range pod.Items {
		//Iterating over all container in a pod
		for i := range podList.Status.ContainerStatuses {
			containerDetailsAfter[podList.Status.ContainerStatuses[i].Name] = append(containerDetailsAfter[podList.Status.ContainerStatuses[i].Name], int(podList.Status.ContainerStatuses[i].RestartCount))
		}
	}

	return (reflect.DeepEqual(containerDetailsBefore[containerName], containerDetailsAfter[containerName])), nil
}

// In this function we are comparing the container Started At time's before chaos and after chaos
// container Start At Time before chaos has to be recorded in the BDD only and passed here as
// an argument. In this function we are getting container Start At Time after chaos and checking
// if it is changed or not. If it is changed then retun true else return false.
func CompareStartedAt(startedAtBefore [9]metav1.Time, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (bool, error) {
	var startedAtAfter [3]metav1.Time
	startedAtChanged := false
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return false, err
	}
	for i, podList := range pod.Items {
		startedAtAfter[i] = (podList.Status.ContainerStatuses[i].State.Running.StartedAt)
	}

	for i := range startedAtAfter {
		if startedAtAfter[i] != startedAtBefore[i] {
			startedAtChanged = true
			break
		}
	}
	return startedAtChanged, nil
}
