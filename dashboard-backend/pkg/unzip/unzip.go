package unzip

import (
	"archive/zip"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/constants"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/customErrors"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

// Unzip unzipes a zipped folder
func Unzip(fileName string, randomString string) error {
	dst := constants.FolderPath + randomString
	archive, err := zip.OpenReader(constants.FolderPath + randomString + fileName)
	if err != nil {
		log.Errorf("unable to read the file %s, err %v", constants.FolderPath+randomString, err)
		return customErrors.InternalServerError()
	}
	defer archive.Close()

	for _, f := range archive.File {
		filePath := filepath.Join(dst, f.Name)
		log.Infof("unzipping file %s", filePath)

		if !strings.HasPrefix(filePath, filepath.Clean(dst)+string(os.PathSeparator)) {
			log.Error("invalid file path")
			return customErrors.InternalServerError()
		}
		if f.FileInfo().IsDir() {
			log.Info("creating a new directory")
			os.MkdirAll(filePath, os.ModePerm)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm); err != nil {
			log.Error("unable to unzip the folder")
			return customErrors.InternalServerError()
		}

		dstFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			log.Error("unable to unzip the folder")
			return customErrors.InternalServerError()
		}

		fileInArchive, err := f.Open()
		if err != nil {
			log.Error("unable to unzip the folder")
			return customErrors.InternalServerError()
		}

		if _, err := io.Copy(dstFile, fileInArchive); err != nil {
			log.Error("unable to unzip the folder")
			return customErrors.InternalServerError()
		}

		dstFile.Close()
		fileInArchive.Close()
	}
	return nil
}
