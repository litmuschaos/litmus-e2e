package utils

import (
	"bytes"
	"fmt"
	"io"
	"time"

	. "github.com/onsi/gomega"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// JobLogs The feature of the function is to wait for the job to get completed and then print the logs of the Job Pod.
func JobLogs(experimentName string, jobNamespace string, engineName string, client *kubernetes.Clientset) (int, error) {

	//Waiting for Job Creation
	for i := 0; i < 10; i++ {
		job, err := client.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + experimentName})
		Expect(err).To(BeNil(), "Fail to get the job in running state")
		if int(len(job.Items)) == 0 {
			fmt.Println("Waiting for Job creation")
			time.Sleep(10 * time.Second)
		} else {
			break
		}

	}
	// Getting the list of job pods for the experiment
	job, err := client.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + experimentName})
	if err != nil {
		return 1, err
	}
	// Getting the pod from the list of pods
	for _, podList := range job.Items {
		//Waiting of some infinite time (3000s) for the compition of job
		//If job gets stuck, then Gitlab job will fail after deafult time(10m)
		for i := 0; i < 300; i++ {
			if string(podList.Status.Phase) != "Succeeded" {
				time.Sleep(10 * time.Second)
				//Getting the jobList again after waiting 10s
				jobPod, err := client.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + experimentName})
				if err != nil {
					return 1, err
				}
				flag := true
				//Getting the pod from jobList after 10s of wait
				for _, jobList := range jobPod.Items {
					if string(jobList.Status.Phase) != "Succeeded" {
						fmt.Printf("Currently, the experiment job pod is in %v State, Please Wait for its completion\n", jobList.Status.Phase)
					} else {
						flag = false
						Expect(string(jobList.Status.Phase)).To(Equal("Succeeded"))
						break
					}
				}
				if flag == false {
					break
				}

			} else {
				break
			}
		}

	}
	//Getting the jobList after the job gets completed
	for _, pod := range job.Items {
		jobPodName := (pod.Name)
		fmt.Printf("JobPodName : %v \n\n\n", jobPodName)
		// After the Job gets completed further commands will print the logs.
		req := client.CoreV1().Pods(jobNamespace).GetLogs(jobPodName, &v1.PodLogOptions{})
		readCloser, err := req.Stream()
		if err != nil {
			fmt.Println("Error2: ", err)
		} else {
			buf := new(bytes.Buffer)
			_, err = io.Copy(buf, readCloser)
			fmt.Println("Experiment logs : \n\n", buf.String())
		}
	}
	return 0, nil
}
