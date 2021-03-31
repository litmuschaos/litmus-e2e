package pkg

import (
	"bytes"
	"fmt"
	"os/exec"

	"github.com/litmuschaos/litmus-e2e/pkg/log"
)

func Apply(command ...string) error {

	var out, stderr bytes.Buffer

	cmd := exec.Command("kubectl", command...)
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err = cmd.Run()
	if err != nil {
		log.Infof(fmt.Sprint(err) + ": " + stderr.String())
		log.Infof("Error: %v", err)
		return err
	}
	log.Infof(out.String())
	return nil
}
