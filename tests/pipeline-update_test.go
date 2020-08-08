package tests

import (
	"io/ioutil"
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

		It("Should check for the result updation", func() {

			testsDetails := types.TestDetails{}

			//Fetching all the default ENV
			By("[PreChaos]: Fetching all default ENVs")
			klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
			environment.GetENV(&testsDetails, "pipeline-update", "")

			//Updating the pipeline status table
			By("Updating the pipeline status table")
			var err error
			coverageData, err := ioutil.ReadFile("../coverage")
			Expect(err).To(BeNil(), "failed reading coverageData from file, due to {%v}", err)

			lines := strings.Split(string(coverageData), "\n")
			klog.Infof("\nFile Content: %s\n", string(lines[0]))
			err = pkg.UpdatePipelineStatus(&testsDetails, string(lines[0]))
			Expect(err).To(BeNil(), "Fail to run the script for pipeline status update,due to {%v}", err)

			klog.Info("Pipeline status updated successfully !!!")

		})
	})
})
