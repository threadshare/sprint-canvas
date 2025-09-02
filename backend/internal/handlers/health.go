package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthCheck 健康检查处理器
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"message": "Foundation Sprint API is running",
		"timestamp": gin.H{},
	})
}