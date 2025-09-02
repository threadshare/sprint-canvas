package models

import (
	"time"
	"github.com/google/uuid"
)

// Vote 投票
type Vote struct {
	ID          string    `json:"id"`
	RoomID      string    `json:"room_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Type        string    `json:"type"` // "note_and_vote", "ranking", "single_choice", "multiple_choice"
	Options     []VoteOption `json:"options"`
	Status      string    `json:"status"` // "active", "completed", "cancelled"
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	EndedAt     *time.Time `json:"ended_at,omitempty"`
}

// VoteOption 投票选项
type VoteOption struct {
	ID          string `json:"id"`
	Text        string `json:"text"`
	Description string `json:"description"`
	Votes       []UserVote `json:"votes"`
}

// UserVote 用户投票
type UserVote struct {
	UserID    string    `json:"user_id"`
	UserName  string    `json:"user_name"`
	Weight    int       `json:"weight"` // 投票权重
	Comment   string    `json:"comment,omitempty"`
	VotedAt   time.Time `json:"voted_at"`
}

// NewVote 创建新投票
func NewVote(roomID, title, description, voteType, createdBy string) *Vote {
	return &Vote{
		ID:          uuid.New().String(),
		RoomID:      roomID,
		Title:       title,
		Description: description,
		Type:        voteType,
		Options:     make([]VoteOption, 0),
		Status:      "active",
		CreatedBy:   createdBy,
		CreatedAt:   time.Now(),
	}
}

// AddOption 添加投票选项
func (v *Vote) AddOption(text, description string) {
	option := VoteOption{
		ID:          uuid.New().String(),
		Text:        text,
		Description: description,
		Votes:       make([]UserVote, 0),
	}
	v.Options = append(v.Options, option)
}

// AddVote 添加用户投票
func (v *Vote) AddUserVote(optionID, userID, userName string, weight int, comment string) error {
	for i := range v.Options {
		if v.Options[i].ID == optionID {
			userVote := UserVote{
				UserID:   userID,
				UserName: userName,
				Weight:   weight,
				Comment:  comment,
				VotedAt:  time.Now(),
			}
			v.Options[i].Votes = append(v.Options[i].Votes, userVote)
			return nil
		}
	}
	return nil
}

// GetResults 获取投票结果
func (v *Vote) GetResults() map[string]int {
	results := make(map[string]int)
	
	for _, option := range v.Options {
		totalScore := 0
		for _, vote := range option.Votes {
			totalScore += vote.Weight
		}
		results[option.ID] = totalScore
	}
	
	return results
}