package pkg

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/litmuschaos/litmus-e2e/pkg/log"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
)

//UpdateResultTable will update the result of pipelines in a table on github using python update script
func UpdateResultTable(experimentDetails, testVerdict string, testsDetails *types.TestDetails) error {

	var out, stderr bytes.Buffer

	//Updating the result table
	log.Infof("The job_id for the job is: %v", os.Getenv("CI_JOB_ID"))
	log.Infof("The testVerdict for the experiment is: %v", testVerdict+"ed")
	//Setup emoji with test result
	if testVerdict == "Pass" {
		testVerdict = testVerdict + "ed :smiley:"
	} else if testVerdict == "Fail" {
		testVerdict = testVerdict + "ed :worried:"
	} else {
		testVerdict = testVerdict + " :cold_sweat:"
	}

	imageTag := GetImageTag(testsDetails.ExperimentImage)
	//Running python script to update result table
	cmd := exec.Command("python3", "-u", "../utils/result_update.py", "--job_id", os.Getenv("CI_JOB_ID"), "--tag", imageTag, "--test_desc", experimentDetails, "--test_result", testVerdict, "--time_stamp", (time.Now().Format(time.ANSIC))+"(IST)", "--token", os.Getenv("GITHUB_TOKEN"), "--test_name", testsDetails.ExperimentName)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		fmt.Println(fmt.Sprint(err) + ": " + stderr.String())
		return err
	}
	log.Infof("Result: " + out.String())
	log.Info("[Table]: Pipeline Result table updated successfully !!!")

	return nil
}

//UpdatePipelineStatus will update the status of pipeline at the end of all jobs
func UpdatePipelineStatus(testsDetails *types.TestDetails, coverageData string) error {

	var out, stderr bytes.Buffer
	var pipelineName string

	imageTag := GetImageTag(testsDetails.ExperimentImage)

	//Updating the result table
	log.Infof("The pipeline id is:", os.Getenv("CI_PIPELINE_ID"))

	if os.Getenv("POD_LEVEL") == "true" {
		pipelineName = "pod-level"
	} else if os.Getenv("NODE_LEVEL") == "true" {
		pipelineName = "node-level"
	} else if os.Getenv("COMPONENT_TEST") == "true" {
		pipelineName = "component"
	} else if os.Getenv("PORTAL_TEST") == "true" {
		pipelineName = "portal-e2e"
		imageTag = testsDetails.Version
	}

	// Recording job number for pipeline update
	cmd := exec.Command("python3", "-u", "../utils/pipeline_status_update.py", "--pipeline_id", os.Getenv("CI_PIPELINE_ID"), "--tag", imageTag, "--time_stamp", (time.Now().Format(time.ANSIC))+"(IST)", "--coverage", coverageData, "--pipeline", pipelineName, "--token", os.Getenv("GITHUB_TOKEN"))
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

// GetImageTag returns the Go experiment image tag
func GetImageTag(experimentImage string) string {

	tag := strings.Split((experimentImage), ":")

	return tag[1]
}

// AddAnnotation will add or update annotation on an application
func AddAnnotation(deployment, key, value, ns string) error {

	command := []string{"annotate", "--overwrite", "deploy/" + deployment, key + "=" + value, "-n", ns}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to modify annotation, err: %v", err)
	}
	return nil
}
