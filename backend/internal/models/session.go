package models

import "time"

// SessionData represents agent session data stored in database
type SessionData struct {
	SessionID      string                 `json:"session_id"`
	AgentName      string                 `json:"agent_name"`
	UserID         string                 `json:"user_id"`
	RoomID         string                 `json:"room_id"`
	Status         string                 `json:"status"`
	Data           map[string]interface{} `json:"data"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
	ExpiresAt      time.Time              `json:"expires_at"`
}