package pkg

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/Jonsy13/portal-e2e-aws/pkg/types"

	"k8s.io/klog"
)

//UpdateResultTable will update the result of pipelines in a table on github using python update script
// func UpdateResultTable(experimentDetails, testVerdict string, testsDetails *types.TestDetails) error {

// 	var out bytes.Buffer
// 	var stderr bytes.Buffer

// 	//Updating the result table
// 	klog.Infof("The job_id for the job is: %v", os.Getenv("CI_JOB_ID"))
// 	klog.Infof("The testVerdict for the experiment is: %v", testVerdict+"ed")
// 	//Setup emoji with test result
// 	if testVerdict == "Pass" {
// 		testVerdict = testVerdict + "ed :smiley:"
// 	} else if testVerdict == "Fail" {
// 		testVerdict = testVerdict + "ed :worried:"
// 	} else {
// 		testVerdict = testVerdict + " :cold_sweat:"
// 	}

// 	imageTag := GetImageTag(testsDetails.GoExperimentImage)
// 	//Running python script to update result table
// 	cmd := exec.Command("python3", "-u", "../utils/result_update.py", "--job_id", os.Getenv("CI_JOB_ID"), "--tag", imageTag, "--test_desc", experimentDetails, "--test_result", testVerdict, "--time_stamp", (time.Now().Format(time.ANSIC))+"(IST)", "--token", os.Getenv("GITHUB_TOKEN"), "--test_name", testsDetails.ExperimentName)
// 	cmd.Stdout = &out
// 	cmd.Stderr = &stderr
// 	err := cmd.Run()
// 	if err != nil {
// 		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())
// 		return err
// 	}
// 	klog.Infof("Result: " + out.String())
// 	klog.Info("[Table]: Pipeline Result table updated successfully !!!")

// 	return nil
// }

//UpdatePipelineStatus will update the status of pipeline at the end of all jobs
func UpdatePipelineStatus(testsDetails *types.TestDetails, coverageData string) error {

	var out, stderr bytes.Buffer
	var pipelineName string
	//Updating the result table
	klog.Info("The pipeline id is:", os.Getenv("CI_PIPELINE_ID"))

	// Recording job number for pipeline update
	cmd := exec.Command("python3", "-u", "../utils/pipeline_status_update.py", "--pipeline_id", os.Getenv("CI_PIPELINE_ID"), "--tag", "ci", "--time_stamp", (time.Now().Format(time.ANSIC))+"(IST)", "--coverage", coverageData, "--pipeline", pipelineName, "--token", os.Getenv("GITHUB_TOKEN"))
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())
		return err
	}
	fmt.Println("Result: " + out.String())

	return nil
}
