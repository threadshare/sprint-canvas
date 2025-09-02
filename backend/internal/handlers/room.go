package handlers

import (
	"context"
	"foundation-sprint/internal/database"
	"foundation-sprint/internal/models"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

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

	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}

	// Create room
	room := models.NewRoom(req.Name, req.CreatedBy)
	
	// Save to database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := db.Rooms().Create(ctx, room); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room"})
		return
	}

	c.JSON(http.StatusCreated, room)
}

// GetRoom 获取房间信息
func GetRoom(c *gin.Context) {
	roomID := c.Param("id")
	
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}
	
	// Get room from database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	room, err := db.Rooms().Get(ctx, roomID)
	if err != nil {
		if err != nil && err.Error() == "not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get room"})
		}
		return
	}

	c.JSON(http.StatusOK, room)
}

// UpdateFoundation 更新基础阶段数据
func UpdateFoundation(c *gin.Context) {
	roomID := c.Param("id")
	
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}

	var foundation models.Foundation
	if err := c.ShouldBindJSON(&foundation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 先获取更新前的room状态
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	beforeRoom, _ := db.Rooms().Get(ctx, roomID)
	log.Printf("🔍 UpdateFoundation - 更新前房间状态: %s, ID: %s", beforeRoom.Status, roomID)
	
	if err := db.Rooms().UpdateFoundation(ctx, roomID, &foundation); err != nil {
		if err != nil && err.Error() == "not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update foundation"})
		}
		return
	}
	
	// Get updated room
	room, err := db.Rooms().Get(ctx, roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated room"})
		return
	}

	log.Printf("🔍 UpdateFoundation - 更新后房间状态: %s, ID: %s", room.Status, roomID)
	c.JSON(http.StatusOK, room)
}

// UpdateDifferentiation 更新差异化阶段数据
func UpdateDifferentiation(c *gin.Context) {
	roomID := c.Param("id")
	
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}

	var differentiation models.Differentiation
	if err := c.ShouldBindJSON(&differentiation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update in database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := db.Rooms().UpdateDifferentiation(ctx, roomID, &differentiation); err != nil {
		if err != nil && err.Error() == "not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update differentiation"})
		}
		return
	}
	
	// Get updated room
	room, err := db.Rooms().Get(ctx, roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated room"})
		return
	}

	c.JSON(http.StatusOK, room)
}

// UpdateRoomStatus 更新房间状态
func UpdateRoomStatus(c *gin.Context) {
	roomID := c.Param("id")
	
	var req struct {
		Status string `json:"status" binding:"required,oneof=foundation differentiation approach completed"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection failed"})
		return
	}
	
	// Update status in database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := db.Rooms().UpdateStatus(ctx, roomID, req.Status); err != nil {
		if err != nil && err.Error() == "not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		}
		return
	}
	
	// Get updated room
	room, err := db.Rooms().Get(ctx, roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated room"})
		return
	}
	
	log.Printf("✅ Room状态更新: %s -> %s, ID: %s", room.Status, req.Status, roomID)
	c.JSON(http.StatusOK, room)
}

// UpdateApproach 更新方法阶段数据
func UpdateApproach(c *gin.Context) {
	roomID := c.Param("id")
	
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}

	var approach models.Approach
	if err := c.ShouldBindJSON(&approach); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update in database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := db.Rooms().UpdateApproach(ctx, roomID, &approach); err != nil {
		if err != nil && err.Error() == "not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update approach"})
		}
		return
	}
	
	// Get updated room
	room, err := db.Rooms().Get(ctx, roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated room"})
		return
	}

	c.JSON(http.StatusOK, room)
}

// ListRooms 列出所有房间
func ListRooms(c *gin.Context) {
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}
	
	// Parse pagination parameters
	offset := 0
	limit := 20
	
	// Get rooms from database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	rooms, err := db.Rooms().List(ctx, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list rooms"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"rooms": rooms,
		"total": len(rooms),
	})
}

// DeleteRoom 删除房间
func DeleteRoom(c *gin.Context) {
	roomID := c.Param("id")
	
	// Get database instance
	db, err := database.GetDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not available"})
		return
	}
	
	// Delete from database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := db.Rooms().Delete(ctx, roomID); err != nil {
		if err != nil && err.Error() == "not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete room"})
		}
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Room deleted successfully"})
}