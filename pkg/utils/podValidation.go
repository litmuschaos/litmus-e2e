package pod

import (
	"strconv"

	chaosTypes "github.com/litmuschaos/litmus-e2e/types"
	"github.com/pkg/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
)

// CompareDeploymentResourceVersion is comparing the Resourse Version of pods before chaos and after chaos
// The sum of Resource Version before chaos has been recorded in the BDD only and passed here
// as an argument. In this function we are getting the sum of Resourse Version of the pod after
// chaos and checking if the different is 0 or not. If the difference of sum of resource version
// before chaos and after chaos is not equal to 0 then the resource version is changed.
func CompareDeploymentResourceVersion(resourceVersionSumBefore int, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (int, error) {

	resourceVersionSumAfter := 0
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	// Getting the list of pods with given label and namespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return 0, errors.Wrapf(err, "Fail to get the list of pods for comparing Deployment resource version, due to:%v", err)
	}
	for _, podList := range pod.Items {
		rv, _ := strconv.Atoi(podList.ResourceVersion)
		resourceVersionSumAfter = resourceVersionSumAfter + rv
	}

	return (resourceVersionSumAfter - resourceVersionSumBefore), nil
}

// ComparePodIP is comparing the PodIPs before chaos and after chaos
// PodIPs before chaos has to be recorded in the BDD only and passed here as
// an argument. In this function we are getting podIP after chaos and checking
// if it is changed or not. If it is changed then retun true else return false.
func ComparePodIP(podIPBefore [3]string, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (bool, error) {

	var podIPAfter [3]string
	podIPChanged := false
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return true, errors.Wrapf(err, "Fail to get the list of pods for comparing Pod IP, due to:%v", err)
	}
	for i, podList := range pod.Items {
		podIPAfter[i] = podList.Status.PodIP
	}
	for i := range podIPBefore {
		if podIPBefore[i] != podIPAfter[i] {
			podIPChanged = true
		}
	}

	return podIPChanged, nil
}

// ComparePodName is comparing the PodNames before chaos and after chaos
// PodNames before chaos has to be recorded in the BDD only and passed here as
// an argument. In this function we are getting podNames after chaos and checking
// if it is changed or not. If it is changed then retun true else return false.
func ComparePodName(podNameBefore [3]string, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (bool, error) {

	var podNameAfter [3]string
	podNameChanged := false
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return true, errors.Wrapf(err, "Fail to get the list of pods for comparing Pod Name, due to:%v", err)
	}
	for i, podList := range pod.Items {
		podNameAfter[i] = podList.Name
	}

	for i := range podNameAfter {
		if podNameAfter[i] != podNameBefore[i] {
			podNameChanged = true
			break
		}
	}
	return podNameChanged, nil
}

// ComparePodResourceVersion is comparing the Resourse Version of containers before chaos and after chaos
// The sum of Resource Version before chaos has been recorded in the BDD only and passed here
// as an argument. In this function we are getting the sum of Resourse Version of the containers after
// chaos and checking if the different is 0 or not. If the difference of sum of resource version
// before chaos and after chaos is not equal to 0 then the resource version is changed.
func ComparePodResourceVersion(resourceVersionSumBefore int, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (int, error) {

	resourceVersionSumAfter := 0
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	// Getting the list of pods with given label and namespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return 0, errors.Wrapf(err, "Fail to get the list of pods for comparing Pod resource Version, due to:%v", err)
	}
	for _, podList := range pod.Items {
		rv, _ := strconv.Atoi(podList.ResourceVersion)
		resourceVersionSumAfter = resourceVersionSumAfter + rv
	}

	return (resourceVersionSumAfter - resourceVersionSumBefore), nil
}

// ComparePodStartTime is comparing the Pod Start Time's before chaos and after chaos
// Pod Start Time's before chaos has to be recorded in the BDD only and passed here as
// an argument. In this function we are getting pod Start Time after chaos and checking
// if it is changed or not. If it is changed then retun true else return false.
func ComparePodStartTime(startTimeBefore [3]*metav1.Time, podDetails chaosTypes.PodDetails, client *kubernetes.Clientset) (bool, error) {

	var startTimeAfter [3]*metav1.Time
	startTimeChanged := false
	podNS := podDetails.PodName
	podLabel := podDetails.PodNamespace
	pod, err := client.CoreV1().Pods(podNS).List(metav1.ListOptions{LabelSelector: podLabel})
	if err != nil {
		return true, errors.Wrapf(err, "Fail to get the list of pods for comparing Pod start time, due to:%v", err)
	}
	for i, podList := range pod.Items {
		startTimeAfter[i] = podList.Status.StartTime
	}

	for i := range startTimeAfter {
		if startTimeBefore[i] != startTimeAfter[i] {
			startTimeChanged = true
			break
		}
	}
	return startTimeChanged, nil
}
