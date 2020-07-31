package pkg

import (
	"bytes"
	"fmt"
	"io"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog"
)

// JobLogs is used to wait for the job to get completed and then prints the log of the Job Pod.
func JobLogs(testsDetails *types.TestDetails, jobNamespace string, clients environment.ClientSets) (error, error) {

	//Waiting for Job Creation
	for i := 0; i < 10; i++ {
		job, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + testsDetails.ExperimentName})
		if err != nil {
			return nil, errors.Errorf("Fail to get the job in running state, due to %v", err)
		}
		if int(len(job.Items)) == 0 {
			klog.Info("Waiting for Job creation")
			time.Sleep(5 * time.Second)
			if i == 9 {
				return nil, errors.Errorf("[Chaos Pod]: Chaos pod unable to come in running state, due to %v", err)
			}
		} else {
			break
		}

	}
	if _, err := JobRunningStatusCheck(testsDetails.ExperimentName, jobNamespace, clients); err != nil {
		return nil, errors.Errorf("Job status check failed, due to %v", err)
	}

	// Getting the list of job pods for the experiment
	job, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + testsDetails.ExperimentName})
	if err != nil {
		return nil, errors.Errorf("Fail to get the list of job pods, due to %v", err)
	}
	// Getting the pod from the list of pods
	for _, podList := range job.Items {
		//Waiting of some infinite time (3000s) for the compition of job
		//If job gets stuck, then Gitlab job will fail after deafult time(10m)
		for i := 0; i < 3000; i++ {
			if string(podList.Status.Phase) != "Succeeded" {
				time.Sleep(10 * time.Second)
				//Getting the jobList again after waiting 10s
				jobPod, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + testsDetails.ExperimentName})
				if err != nil || len(jobPod.Items) == 0 {
					return nil, errors.Errorf("Fail to get the list of job pods after wait, due to %v", err)
				}

				flag := true
				//Getting the pod from jobList after waiting 10s
				for _, jobList := range jobPod.Items {
					if string(jobList.Status.Phase) != "Succeeded" {
						klog.Infof("Currently, the experiment job pod is in %v State, Please Wait for its completion\n", jobList.Status.Phase)
					} else {
						flag = false
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
		klog.Infof("JobPodName : %v \n\n\n", jobPodName)
		// After the Job gets completed further commands will print the logs.
		req := clients.KubeClient.CoreV1().Pods(jobNamespace).GetLogs(jobPodName, &v1.PodLogOptions{})
		readCloser, err := req.Stream()
		if err != nil {
			fmt.Println("Error2: ", err)
		} else {
			buf := new(bytes.Buffer)
			_, err = io.Copy(buf, readCloser)
			fmt.Println("Experiment logs : \n\n", buf.String())
		}
	}
	return nil, nil
}

//JobRunningStatusCheck Checks the Job Running status
func JobRunningStatusCheck(ExperimentName, jobNamespace string, clients environment.ClientSets) (error, error) {
	job, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + ExperimentName})
	if err != nil {
		return nil, errors.Errorf("Fail to get the list of job pods, due to %v", err)
	}
	for _, podList := range job.Items {
		for i := 0; i < 12; i++ {
			if string(podList.Status.Phase) != "Running" {
				time.Sleep(5 * time.Second)
				jobPod, err := clients.KubeClient.CoreV1().Pods(jobNamespace).List(metav1.ListOptions{LabelSelector: "name=" + ExperimentName})
				if err != nil || len(jobPod.Items) == 0 {
					return nil, errors.Errorf("Fail to get the list of job pods after wait, due to %v", err)
				}
				flag := true
				//Getting the pod from jobList after waiting 10s
				for _, jobList := range jobPod.Items {
					if string(jobList.Status.Phase) != "Running" {
						klog.Infof("Job pod Status: %v \n", jobList.Status.Phase)
					} else {
						flag = false
						break
					}
				}
				if flag == false {
					break
				}

			} else {
				break
			}
			if i == 11 {
				return nil, errors.Errorf("Job pod fail to get in Running state")
			}
		}
	}
	return nil, nil
}
