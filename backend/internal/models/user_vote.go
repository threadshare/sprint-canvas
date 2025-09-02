package models

import "time"

// DBUserVote represents an individual user's vote in a voting session (for database storage)
type DBUserVote struct {
	ID        string    `json:"id"`
	RoomID    string    `json:"room_id"`
	UserID    string    `json:"user_id"`
	VoteType  string    `json:"vote_type"`
	Option    string    `json:"option"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}