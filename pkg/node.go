package pkg

import (
	"github.com/litmuschaos/litmus-e2e/pkg/types"
	"github.com/pkg/errors"
)

// NodeCordon will cordon the given node
func NodeCordon(testsDetails *types.TestDetails) error {

	command := []string{"cordon", testsDetails.ApplicationNodeName}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to cordon the node, err: %v", err)
	}
	return nil
}

// NodeUncordon will uncordon the given node
func NodeUncordon(testsDetails *types.TestDetails) error {

	command := []string{"uncordon", testsDetails.ApplicationNodeName}
	err := Kubectl(command...)
	if err != nil {
		return errors.Errorf("Failed to uncordon the node, err: %v", err)
	}
	return nil
}
