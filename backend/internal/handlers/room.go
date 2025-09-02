package handlers

import (
	"foundation-sprint/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 临时内存存储（实际项目中应该使用数据库）
var rooms = make(map[string]*models.Room)

// CreateRoom 创建新房间
func CreateRoom(c *gin.Context) {
	var req struct {
		Name      string `json:"name" binding:"required"`
		CreatedBy string `json:"created_by" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room := models.NewRoom(req.Name, req.CreatedBy)
	rooms[room.ID] = room

	c.JSON(http.StatusCreated, room)
}

// GetRoom 获取房间信息
func GetRoom(c *gin.Context) {
	roomID := c.Param("id")
	
	room, exists := rooms[roomID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	c.JSON(http.StatusOK, room)
}

// UpdateFoundation 更新基础阶段数据
func UpdateFoundation(c *gin.Context) {
	roomID := c.Param("id")
	
	room, exists := rooms[roomID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	var foundation models.Foundation
	if err := c.ShouldBindJSON(&foundation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room.Foundation = foundation
	if room.Status == "foundation" {
		room.Status = "differentiation"
	}
	
	c.JSON(http.StatusOK, room)
}

// UpdateDifferentiation 更新差异化阶段数据
func UpdateDifferentiation(c *gin.Context) {
	roomID := c.Param("id")
	
	room, exists := rooms[roomID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	var differentiation models.Differentiation
	if err := c.ShouldBindJSON(&differentiation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room.Differentiation = differentiation
	if room.Status == "differentiation" {
		room.Status = "approach"
	}
	
	c.JSON(http.StatusOK, room)
}

// UpdateApproach 更新方法阶段数据
func UpdateApproach(c *gin.Context) {
	roomID := c.Param("id")
	
	room, exists := rooms[roomID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	var approach models.Approach
	if err := c.ShouldBindJSON(&approach); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room.Approach = approach
	if room.Status == "approach" {
		room.Status = "completed"
	}
	
	c.JSON(http.StatusOK, room)
}