package deleteFolder

import (
	"os"

	"github.com/litmuschaos/litmus-go/pkg/log"
)

// DeleteFolder deletes a folder
func DeleteFolder(folderName string) {
	log.Info("Start deleting folder")

	err := os.RemoveAll(folderName)
	if err != nil {
		log.Warnf("Failed to delete folder %s, err %v", folderName, err)
	}

	log.Infof("Successfully deleted folder %s", folderName)
}
