package tests

import (
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
		environment.GetENV(&testsDetails, "pipeline-update", "")
		if testsDetails.UpdateWebsite == "true" {
			It("Should check for the result updation", func() {

				testsDetails := types.TestDetails{}
				var err error

				//Fetching all the default ENV
				By("[PreChaos]: Fetching all default ENVs")
				klog.Infof("[PreReq]: Getting the ENVs for the %v test", testsDetails.ExperimentName)
				environment.GetENV(&testsDetails, "pipeline-update", "")

				// TODO: Currently coverageData is hardcoded as 60%, Need to be changed to actual coverage.
				err = pkg.UpdatePipelineStatus(&testsDetails, "60")
				Expect(err).To(BeNil(), "Failed to run the script for pipeline status update,due to {%v}", err)
				klog.Info("Pipeline status updated successfully !!!")

			})

			It("Should check for the result updation", func() {

				//TODO: Need new logic for checking the result updation
			})
		} else {
			klog.Info("[SKIP]: Skip updating the result on website")
		}

	})
})
