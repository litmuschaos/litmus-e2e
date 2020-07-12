package tests

import (
	"testing"

	"github.com/litmuschaos/litmus-e2e/pkg/utils"
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

			//Updating the pipeline status table
			By("Updating the pipeline status table")
			var err error
			err = utils.UpdatePipelineStatus()
			Expect(err).To(BeNil(), "Fail run the script for pipeline status updation")
			klog.Info("Pipeline status updated successfully !!!")

		})
	})
})
