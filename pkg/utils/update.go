package utils

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"time"

	chaosClient "github.com/litmuschaos/chaos-operator/pkg/client/clientset/versioned/typed/litmuschaos/v1alpha1"
	chaosTypes "github.com/litmuschaos/litmus-e2e/types"

	"k8s.io/klog"
)

//UpdateResultTable will update the result of pipelines in a table on github using python update script
func UpdateResultTable(clientSet *chaosClient.LitmuschaosV1alpha1Client, experimentDetails, testVerdict, engineName, experimentName string) error {

	var out bytes.Buffer
	var stderr bytes.Buffer
	//Updating the result table
	klog.Infof("The job_id for the job is: %v", os.Getenv("CI_JOB_ID"))
	klog.Infof("The testVerdict for the experiment is: %v", testVerdict+"ed")
	//Setup emoji with test result
	if testVerdict == "Pass" {
		testVerdict = testVerdict + "ed :smiley:"
	} else if testVerdict == "Fail" {
		testVerdict = testVerdict + "ed :worried:"
	} else {
		testVerdict = testVerdict + " :cold_sweat:"
	}
	//Running python script to update result table
	cmd := exec.Command("python3", "-u", "../utils/result_update.py", "--job_id", os.Getenv("CI_JOB_ID"), "--tag", chaosTypes.ExperimentImageTag, "--test_desc", experimentDetails, "--test_result", testVerdict, "--time_stamp", (time.Now().Format(time.ANSIC))+"(IST)", "--token", os.Getenv("GITHUB_TOKEN"), "--test_name", experimentName)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())
		return err
	}
	fmt.Println("Result: " + out.String())
	return nil
}

//UpdatePipelineStatus will update the status of pipeline at the end of all jobs
func UpdatePipelineStatus(coverageData string) error {

	var out bytes.Buffer
	var stderr bytes.Buffer
	//Updating the result table
	klog.Info("The pipeline id is:", os.Getenv("CI_PIPELINE_ID"))
	klog.Info("The release tag for running pipeline is:", chaosTypes.ExperimentImageTag)
	// Recording job number for pipeline update
	cmd := exec.Command("python3", "-u", "../utils/pipeline_status_update.py", "--pipeline_id", os.Getenv("CI_PIPELINE_ID"), "--tag", chaosTypes.ExperimentImageTag, "--time_stamp", (time.Now().Format(time.ANSIC))+"(IST)", "--coverage", coverageData, "--token", os.Getenv("GITHUB_TOKEN"))
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())
		return err
	}
	fmt.Println("Result: " + out.String())

	return nil
}
