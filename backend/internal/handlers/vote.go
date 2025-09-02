package handlers

import (
	"foundation-sprint/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 临时内存存储投票数据
var votes = make(map[string]*models.Vote)
var roomVotes = make(map[string][]string) // roomID -> []voteID

// CreateVote 创建投票
func CreateVote(c *gin.Context) {
	roomID := c.Param("id")
	
	var req struct {
		Title       string   `json:"title" binding:"required"`
		Description string   `json:"description"`
		Type        string   `json:"type" binding:"required"`
		Options     []string `json:"options"`
		CreatedBy   string   `json:"created_by" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查房间是否存在
	if _, exists := rooms[roomID]; !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	vote := models.NewVote(roomID, req.Title, req.Description, req.Type, req.CreatedBy)
	
	// 添加选项
	for _, optionText := range req.Options {
		vote.AddOption(optionText, "")
	}

	votes[vote.ID] = vote
	
	// 添加到房间投票列表
	if roomVotes[roomID] == nil {
		roomVotes[roomID] = make([]string, 0)
	}
	roomVotes[roomID] = append(roomVotes[roomID], vote.ID)

	c.JSON(http.StatusCreated, vote)
}

// GetVotes 获取房间的所有投票
func GetVotes(c *gin.Context) {
	roomID := c.Param("id")
	
	voteIDs, exists := roomVotes[roomID]
	if !exists {
		c.JSON(http.StatusOK, []models.Vote{})
		return
	}

	roomVoteList := make([]*models.Vote, 0)
	for _, voteID := range voteIDs {
		if vote, exists := votes[voteID]; exists {
			roomVoteList = append(roomVoteList, vote)
		}
	}

	c.JSON(http.StatusOK, roomVoteList)
}

// UpdateVote 更新投票（添加用户投票）
func UpdateVote(c *gin.Context) {
	voteID := c.Param("id")
	
	vote, exists := votes[voteID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vote not found"})
		return
	}

	var req struct {
		OptionID string `json:"option_id" binding:"required"`
		UserID   string `json:"user_id" binding:"required"`
		UserName string `json:"user_name" binding:"required"`
		Weight   int    `json:"weight"`
		Comment  string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 默认权重为1
	if req.Weight == 0 {
		req.Weight = 1
	}

	err := vote.AddUserVote(req.OptionID, req.UserID, req.UserName, req.Weight, req.Comment)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, vote)
}