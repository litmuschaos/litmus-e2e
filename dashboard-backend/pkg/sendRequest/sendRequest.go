package sendRequest

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/customErrors"
	"github.com/litmuschaos/litmus-e2e/e2e-dashboard-backend/pkg/env"
	"github.com/litmuschaos/litmus-go/pkg/log"
)

// SendGetRequest makes a get request to the url
func SendGetRequest(Url string) (interface{}, error) {
	log.Infof("making get request to %s", Url)
	req, err := http.NewRequest("GET", Url, nil)
	if err != nil {
		log.Errorf("failed to create a new http request, err %v", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/vnd.github.v3+json")
	req.SetBasicAuth(env.GoDotEnvVariable("GITHUB_USERNAME"), env.GoDotEnvVariable("GITHUB_PAT"))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Errorf("failed to execute http request, err %v", err)
		return nil, err
	}
	if resp.StatusCode >= 300 {
		log.Errorf("Request failed with status code %d", resp.StatusCode)
		return nil, customErrors.NonSuccessStatusCode(resp.StatusCode)
	}
	defer resp.Body.Close()
	log.Infof("resp.Body is %v", resp.Body)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("failed to read response, err %v", err)
		return nil, err
	}
	var objmap map[string]interface{}
	err = json.Unmarshal(body, &objmap)
	if err != nil {
		log.Errorf("unable to unmarshal body into objmap", err)
		var arrmap []interface{}
		err = json.Unmarshal(body, &arrmap)
		if err != nil {
			log.Errorf("unable to unmarshal body into arrmap", err)
			return nil, err
		}
		log.Infof("arrmap is %v", arrmap)
		return arrmap, nil
	}
	log.Infof("objmap is %v", objmap)
	return objmap, nil
}

// SendGetRequestWrapper does error handling for SendGetRequest function
func SendGetRequestWrapper(c *gin.Context, Url string) {
	resp, err := SendGetRequest(Url)
	if err != nil {
		c.JSON(400, gin.H{
			"status": "error",
			"error":  err.Error(),
		})
		return
	}
	c.JSON(200, resp)
}
