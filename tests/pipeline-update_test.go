package tests

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os/exec"
	"strings"
	"testing"

	"github.com/litmuschaos/litmus-e2e/pkg"
	"github.com/litmuschaos/litmus-e2e/pkg/environment"
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/klog"
)

func TestPipelineUpdate(t *testing.T) {

	RegisterFailHandler(Fail)
	RunSpecs(t, "BDD test")
}

//BDD Tests for updating pipeline status
var _ = Describe("BDD of pipeline status update", func() {

	// BDD for overall pipeline result update
	Context("Check for the overall pipeline update", func() {

		testsDetails := types.TestDetails{}
		if testsDetails.UpdateWebsite == "true" {
			It("Should check for the result updation", func() {

				testsDetails := types.TestDetails{}
				var err error
				var out, stderr bytes.Buffer

				//Fetching all the default ENV
				By("[PreChaos]: Fetching all default ENVs")
				klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
				environment.GetENV(&testsDetails, "pipeline-update", "")

				//Setup metrics to get pipeline details
				//Creating rbac
				cmd := exec.Command("bash", "../metrics/e2e-metrics", "start")
				cmd.Stdout = &out
				cmd.Stderr = &stderr
				err = cmd.Run()
				klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
				Expect(err).To(BeNil(), "Fail to setup metrics for pipeline, due to {%v}", err)

				//Updating the pipeline status table
				By("Updating the pipeline status table")
				coverageData, err := ioutil.ReadFile("e2e-metrics/coverage")
				Expect(err).To(BeNil(), "failed reading coverageData from file, due to {%v}", err)

				lines := strings.Split(string(coverageData), "\n")
				klog.Infof("\nFile Content: %s\n", string(lines[0]))
				err = pkg.UpdatePipelineStatus(&testsDetails, string(lines[0]))
				Expect(err).To(BeNil(), "Fail to run the script for pipeline status update,due to {%v}", err)
				klog.Info("Pipeline status updated successfully !!!")

			})

			It("Should check for the result updation", func() {

				var err error
				var out, stderr bytes.Buffer
				//Setup metrics to get pipeline details
				//Creating rbac
				cmdStop := exec.Command("bash", "../metrics/e2e-metrics", "stop")
				cmdStop.Stdout = &out
				cmdStop.Stderr = &stderr
				err = cmdStop.Run()
				klog.Infof(fmt.Sprint(err) + ": " + stderr.String())
				Expect(err).To(BeNil(), "Fail to setup metrics for pipeline, due to {%v}", err)

			})
		} else {
			klog.Info("[SKIP]: Skip updating the result on website")
		}

	})
})
