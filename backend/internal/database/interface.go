package database

import (
	"context"
	"foundation-sprint/internal/models"
	"time"
)

// Database defines the interface for all database operations
type Database interface {
	// Connection management
	Connect(ctx context.Context) error
	Close() error
	Ping(ctx context.Context) error
	
	// Transaction support
	BeginTx(ctx context.Context) (Transaction, error)
	
	// Repository getters
	Rooms() RoomRepository
	Votes() VoteRepository
	Sessions() SessionRepository
	
	// Migration
	Migrate(ctx context.Context) error
}

// Transaction represents a database transaction
type Transaction interface {
	Commit() error
	Rollback() error
	
	// Repository getters within transaction
	Rooms() RoomRepository
	Votes() VoteRepository
	Sessions() SessionRepository
}

// RoomRepository defines operations for Room entities
type RoomRepository interface {
	// Create creates a new room
	Create(ctx context.Context, room *models.Room) error
	
	// Get retrieves a room by ID
	Get(ctx context.Context, id string) (*models.Room, error)
	
	// GetByUser retrieves all rooms created by a user
	GetByUser(ctx context.Context, userID string) ([]*models.Room, error)
	
	// Update updates a room
	Update(ctx context.Context, room *models.Room) error
	
	// Delete deletes a room
	Delete(ctx context.Context, id string) error
	
	// List lists rooms with pagination
	List(ctx context.Context, offset, limit int) ([]*models.Room, error)
	
	// UpdateFoundation updates the foundation phase data
	UpdateFoundation(ctx context.Context, roomID string, foundation *models.Foundation) error
	
	// UpdateDifferentiation updates the differentiation phase data
	UpdateDifferentiation(ctx context.Context, roomID string, differentiation *models.Differentiation) error
	
	// UpdateApproach updates the approach phase data
	UpdateApproach(ctx context.Context, roomID string, approach *models.Approach) error
	
	// UpdateStatus updates the room status
	UpdateStatus(ctx context.Context, roomID string, status string) error
}

// VoteRepository defines operations for Vote entities
type VoteRepository interface {
	// Create creates a new vote
	Create(ctx context.Context, vote *models.DBUserVote) error
	
	// Get retrieves a vote by ID
	Get(ctx context.Context, id string) (*models.DBUserVote, error)
	
	// GetByRoom retrieves all votes for a room
	GetByRoom(ctx context.Context, roomID string) ([]*models.DBUserVote, error)
	
	// GetByRoomAndType retrieves votes by room and type
	GetByRoomAndType(ctx context.Context, roomID string, voteType string) ([]*models.DBUserVote, error)
	
	// Update updates a vote
	Update(ctx context.Context, vote *models.DBUserVote) error
	
	// Delete deletes a vote
	Delete(ctx context.Context, id string) error
	
	// CountByOption counts votes for each option
	CountByOption(ctx context.Context, roomID string, voteType string) (map[string]int, error)
}


// SessionRepository defines operations for Session entities
type SessionRepository interface {
	// Create creates a new session
	Create(ctx context.Context, session *models.SessionData) error
	
	// Get retrieves a session by ID
	Get(ctx context.Context, sessionID string) (*models.SessionData, error)
	
	// GetByAgent retrieves all sessions for an agent
	GetByAgent(ctx context.Context, agentName string) ([]*models.SessionData, error)
	
	// GetByUser retrieves all sessions for a user
	GetByUser(ctx context.Context, userID string) ([]*models.SessionData, error)
	
	// GetByRoom retrieves all sessions for a room
	GetByRoom(ctx context.Context, roomID string) ([]*models.SessionData, error)
	
	// Update updates a session
	Update(ctx context.Context, session *models.SessionData) error
	
	// Delete deletes a session
	Delete(ctx context.Context, sessionID string) error
	
	// DeleteExpired deletes all expired sessions
	DeleteExpired(ctx context.Context) error
	
	// UpdateStatus updates session status
	UpdateStatus(ctx context.Context, sessionID string, status string) error
	
	// UpdateExpiry updates session expiry time
	UpdateExpiry(ctx context.Context, sessionID string, expiresAt time.Time) error
}

// QueryOptions provides options for queries
type QueryOptions struct {
	Offset  int
	Limit   int
	OrderBy string
	Order   string // "asc" or "desc"
	Where   map[string]interface{}
}


// Error types
type Error struct {
	Code    string
	Message string
	Err     error
}

func (e *Error) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

// Common error codes
const (
	ErrCodeNotFound     = "NOT_FOUND"
	ErrCodeDuplicate    = "DUPLICATE"
	ErrCodeInvalidInput = "INVALID_INPUT"
	ErrCodeDatabase     = "DATABASE_ERROR"
	ErrCodeTransaction  = "TRANSACTION_ERROR"
)

// Common errors
var (
	ErrNotFound     = &Error{Code: ErrCodeNotFound, Message: "entity not found"}
	ErrDuplicate    = &Error{Code: ErrCodeDuplicate, Message: "entity already exists"}
	ErrInvalidInput = &Error{Code: ErrCodeInvalidInput, Message: "invalid input"}
	ErrDatabase     = &Error{Code: ErrCodeDatabase, Message: "database error"}
	ErrTransaction  = &Error{Code: ErrCodeTransaction, Message: "transaction error"}
)