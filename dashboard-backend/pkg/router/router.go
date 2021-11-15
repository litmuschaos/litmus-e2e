package router

import (
	"github.com/Aman-Codes/e2e-dashboard-backend/pkg/constants"
	"github.com/Aman-Codes/e2e-dashboard-backend/pkg/customErrors"
	"github.com/Aman-Codes/e2e-dashboard-backend/pkg/fetchLog"
	"github.com/Aman-Codes/e2e-dashboard-backend/pkg/sendRequest"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Router() {
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": customErrors.Success(),
		})
	})
	router.POST("/logs", fetchLog.FetchLogApi)
	router.GET("/repos/:orgName/litmus-e2e/actions/workflows", func(c *gin.Context) {
		orgName := c.Param("orgName")
		sendRequest.SendGetRequestWrapper(c, constants.BaseGitHubUrl+"/repos/"+orgName+"/litmus-e2e/actions/workflows")
	})
	router.GET("/repos/:orgName/litmus-e2e/actions/runs/:pipelineId/jobs", func(c *gin.Context) {
		orgName := c.Param("orgName")
		pipelineId := c.Param("pipelineId")
		sendRequest.SendGetRequestWrapper(c, constants.BaseGitHubUrl+"/repos/"+orgName+"/litmus-e2e/actions/runs/"+pipelineId+"/jobs")
	})
	router.GET("/repos/:orgName/litmus-e2e/actions/runs", func(c *gin.Context) {
		orgName := c.Param("orgName")
		sendRequest.SendGetRequestWrapper(c, constants.BaseGitHubUrl+"/repos/"+orgName+"/litmus-e2e/actions/runs")
	})
	router.GET("/repos/:orgName/litmus-e2e/actions/workflows/:workflowName/runs", func(c *gin.Context) {
		orgName := c.Param("orgName")
		workflowName := c.Param("workflowName")
		sendRequest.SendGetRequestWrapper(c, constants.BaseGitHubUrl+"/repos/"+orgName+"/litmus-e2e/actions/workflows/"+workflowName+"/runs")
	})
	router.GET("/repos/:orgName/litmus-go/commits", func(c *gin.Context) {
		orgName := c.Param("orgName")
		sendRequest.SendGetRequestWrapper(c, constants.BaseGitHubUrl+"/repos/"+orgName+"/litmus-go/commits")
	})
	router.Run(":8080")
}
