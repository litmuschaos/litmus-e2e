package fetchLog

import (
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/constants"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/customErrors"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/env"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/unzip"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/utils"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

type LogsInput struct {
	PipelineId int    `json:"pipelineId" binding:"required"`
	JobName    string `json:"jobName" binding:"required"`
	StepNumber int    `json:"stepNumber" binding:"required"`
}

// parseUrl extracts fileName from the url
func parseUrl(fullURLFile string) (string, error) {
	log.Info("Start to fetch log")
	fileURL, err := url.Parse(fullURLFile)
	if err != nil {
		log.Errorf("failed to parse URL, err %v", err)
		return "", customErrors.InternalServerError()
	}
	log.Infof("The parsed fileURL is %s", fileURL)
	path := fileURL.Path
	segments := strings.Split(path, "/")
	fileName := segments[len(segments)-1] + ".zip"
	log.Infof("fileName is %s", fileName)
	return fileName, nil
}

// fetchLog fetches job log
func fetchLog(fullURLFile string, randomString string) error {
	fileName, err := parseUrl(fullURLFile)
	if err != nil {
		return err
	}

	// Create blank file
	file, err := os.Create(constants.FolderPath + randomString + fileName)
	if err != nil {
		log.Errorf("failed to create file %s, err %v", fileName, err)
		return customErrors.InternalServerError()
	}
	log.Infof("Successfully created file %s", constants.FolderPath+randomString+fileName)

	client := http.Client{
		CheckRedirect: func(r *http.Request, via []*http.Request) error {
			r.URL.Opaque = r.URL.Path
			return nil
		},
	}
	// Put content on file
	req, err := http.NewRequest(http.MethodGet, fullURLFile, http.NoBody)
	if err != nil {
		log.Errorf("failed to create a new http request, err %v", err)
		return customErrors.InternalServerError()
	}
	req.SetBasicAuth(env.GoDotEnvVariable("GITHUB_USERNAME"), env.GoDotEnvVariable("GITHUB_PAT"))
	resp, err := client.Do(req)
	if err != nil {
		log.Errorf("failed to execute http request, err %v", err)
		return customErrors.InternalServerError()
	}
	if resp.StatusCode >= 300 {
		log.Errorf("Request failed with status code %d", resp.StatusCode)
		return customErrors.NonSuccessStatusCode(resp.StatusCode)
	}
	defer resp.Body.Close()

	size, err := io.Copy(file, resp.Body)
	if err != nil {
		log.Errorf("failed to copy content from response to file, err %v", err)
		return customErrors.InternalServerError()
	}
	defer file.Close()
	err = unzip.Unzip(fileName, randomString)
	if err != nil {
		log.Errorf("failed to unzip file %s", fileName)
		return customErrors.InternalServerError()
	}
	log.Infof("Downloaded a file %s with size %d", fileName, size)
	log.Info("Successfullly fetched log")
	return nil
}

// FetchLogApi handles the fetch log request
func FetchLogApi(c *gin.Context) {
	var logsInput LogsInput
	c.BindJSON(&logsInput)
	logsInput.JobName = filepath.Clean(logsInput.JobName)
	log.Infof("received parameters for post request are, pipelineId: %s, jobName: %s, stepNumber: %s", logsInput.PipelineId, logsInput.JobName, logsInput.StepNumber)
	fullURLFile := constants.BaseGitHubUrl + "/repos/litmuschaos/litmus-e2e/actions/runs/" + strconv.Itoa(logsInput.PipelineId) + "/logs"
	randomString := utils.RandString(8)
	log.Infof("randomString is %s", randomString)
	err := fetchLog(fullURLFile, randomString)
	if err != nil {
		customErrors.HandleError(c, err)
		return
	}
	dir := constants.FolderPath + randomString + "/" + logsInput.JobName
	log.Infof("start reading dir %s", dir)
	files, err := os.ReadDir(dir)
	if err != nil {
		log.Errorf("unable to read dir, err %v", err)
		customErrors.HandleError(c, err)
		return
	}
	for _, f := range files {
		log.Infof("file name is %s", f.Name())
		if strings.HasPrefix(f.Name(), strconv.Itoa(logsInput.StepNumber)+"_") {
			log.Infof("the required file name is %s", f.Name())
			fileName := dir + "/" + f.Name()
			log.Infof("start reading file %s", fileName)
			buf, err := os.ReadFile(fileName)
			if err != nil {
				log.Errorf("unable to read file, err %v", err)
				customErrors.HandleError(c, err)
				return
			}
			c.Data(200, "application/json; charset=utf-8", buf)
			return
		}
	}
	customErrors.HandleError(c, err)
}
