package tests

import (
	"fmt"
	"io/ioutil"
	"strings"
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
			coverageData, err := ioutil.ReadFile("../coverage")
			if err != nil {
				klog.Infof("failed reading coverageData from file: %s", err)
			}
			lines := strings.Split(string(coverageData), "\n")
			fmt.Printf("\nFile Content: %s\n", string(lines[0]))
			err = utils.UpdatePipelineStatus(string(lines[0]))
			Expect(err).To(BeNil(), "Fail run the script for pipeline status updation")
			klog.Info("Pipeline status updated successfully !!!")

		})
	})
})
