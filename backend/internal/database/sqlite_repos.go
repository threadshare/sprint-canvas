package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"foundation-sprint/internal/models"
	"time"
)

// sqliteRoomRepo implements RoomRepository for SQLite
type sqliteRoomRepo struct {
	db dbExecutor
}

func (r *sqliteRoomRepo) Create(ctx context.Context, room *models.Room) error {
	query := `
		INSERT INTO rooms (id, name, created_by, created_at, updated_at, status)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	
	_, err := r.db.ExecContext(ctx, query,
		room.ID,
		room.Name,
		room.CreatedBy,
		room.CreatedAt,
		room.UpdatedAt,
		room.Status,
	)
	
	if err != nil {
		return fmt.Errorf("failed to create room: %w", err)
	}
	
	return nil
}

func (r *sqliteRoomRepo) Get(ctx context.Context, id string) (*models.Room, error) {
	query := `
		SELECT id, name, created_by, created_at, updated_at, status,
		       foundation_data, differentiation_data, approach_data
		FROM rooms
		WHERE id = ?
	`
	
	var room models.Room
	var foundationData, differentiationData, approachData sql.NullString
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&room.ID,
		&room.Name,
		&room.CreatedBy,
		&room.CreatedAt,
		&room.UpdatedAt,
		&room.Status,
		&foundationData,
		&differentiationData,
		&approachData,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get room: %w", err)
	}
	
	// Initialize with empty slices to avoid nil values
	room.Foundation = models.Foundation{
		Customers:   make([]string, 0),
		Problems:    make([]string, 0),
		Competition: make([]string, 0),
		Advantages:  make([]string, 0),
	}
	room.Differentiation = models.Differentiation{
		ClassicFactors: make([]models.DifferentiationFactor, 0),
		CustomFactors:  make([]models.DifferentiationFactor, 0),
		Matrix: models.Matrix2x2{
			XAxis:           "",
			YAxis:           "",
			Products:        make([]models.ProductPosition, 0),
			WinningQuadrant: "",
		},
		Principles: make([]string, 0),
	}
	room.Approach = models.Approach{
		Paths:       make([]models.Path, 0),
		MagicLenses: make([]models.MagicLens, 0),
	}
	
	// Unmarshal JSON data over the initialized structures
	if foundationData.Valid && foundationData.String != "" {
		if err := json.Unmarshal([]byte(foundationData.String), &room.Foundation); err != nil {
			return nil, fmt.Errorf("failed to unmarshal foundation data: %w", err)
		}
	}
	
	if differentiationData.Valid && differentiationData.String != "" {
		if err := json.Unmarshal([]byte(differentiationData.String), &room.Differentiation); err != nil {
			return nil, fmt.Errorf("failed to unmarshal differentiation data: %w", err)
		}
	}
	
	if approachData.Valid && approachData.String != "" {
		if err := json.Unmarshal([]byte(approachData.String), &room.Approach); err != nil {
			return nil, fmt.Errorf("failed to unmarshal approach data: %w", err)
		}
	}
	
	return &room, nil
}

func (r *sqliteRoomRepo) GetByUser(ctx context.Context, userID string) ([]*models.Room, error) {
	query := `
		SELECT id, name, created_by, created_at, updated_at, status
		FROM rooms
		WHERE created_by = ?
		ORDER BY created_at DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query rooms: %w", err)
	}
	defer rows.Close()
	
	var rooms []*models.Room
	for rows.Next() {
		var room models.Room
		err := rows.Scan(
			&room.ID,
			&room.Name,
			&room.CreatedBy,
			&room.CreatedAt,
			&room.UpdatedAt,
			&room.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan room: %w", err)
		}
		rooms = append(rooms, &room)
	}
	
	return rooms, nil
}

func (r *sqliteRoomRepo) Update(ctx context.Context, room *models.Room) error {
	query := `
		UPDATE rooms
		SET name = ?, updated_at = ?, status = ?
		WHERE id = ?
	`
	
	result, err := r.db.ExecContext(ctx, query,
		room.Name,
		time.Now(),
		room.Status,
		room.ID,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update room: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (r *sqliteRoomRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM rooms WHERE id = ?`
	
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (r *sqliteRoomRepo) List(ctx context.Context, offset, limit int) ([]*models.Room, error) {
	query := `
		SELECT id, name, created_by, created_at, updated_at, status
		FROM rooms
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`
	
	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query rooms: %w", err)
	}
	defer rows.Close()
	
	var rooms []*models.Room
	for rows.Next() {
		var room models.Room
		err := rows.Scan(
			&room.ID,
			&room.Name,
			&room.CreatedBy,
			&room.CreatedAt,
			&room.UpdatedAt,
			&room.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan room: %w", err)
		}
		rooms = append(rooms, &room)
	}
	
	return rooms, nil
}

func (r *sqliteRoomRepo) UpdateFoundation(ctx context.Context, roomID string, foundation *models.Foundation) error {
	data, err := json.Marshal(foundation)
	if err != nil {
		return fmt.Errorf("failed to marshal foundation data: %w", err)
	}
	
	query := `
		UPDATE rooms
		SET foundation_data = ?, updated_at = ?
		WHERE id = ?
	`
	
	result, err := r.db.ExecContext(ctx, query, string(data), time.Now(), roomID)
	if err != nil {
		return fmt.Errorf("failed to update foundation: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (r *sqliteRoomRepo) UpdateDifferentiation(ctx context.Context, roomID string, differentiation *models.Differentiation) error {
	data, err := json.Marshal(differentiation)
	if err != nil {
		return fmt.Errorf("failed to marshal differentiation data: %w", err)
	}
	
	query := `
		UPDATE rooms
		SET differentiation_data = ?, updated_at = ?
		WHERE id = ?
	`
	
	result, err := r.db.ExecContext(ctx, query, string(data), time.Now(), roomID)
	if err != nil {
		return fmt.Errorf("failed to update differentiation: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (r *sqliteRoomRepo) UpdateApproach(ctx context.Context, roomID string, approach *models.Approach) error {
	data, err := json.Marshal(approach)
	if err != nil {
		return fmt.Errorf("failed to marshal approach data: %w", err)
	}
	
	query := `
		UPDATE rooms
		SET approach_data = ?, updated_at = ?
		WHERE id = ?
	`
	
	result, err := r.db.ExecContext(ctx, query, string(data), time.Now(), roomID)
	if err != nil {
		return fmt.Errorf("failed to update approach: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (r *sqliteRoomRepo) UpdateStatus(ctx context.Context, roomID string, status string) error {
	query := `
		UPDATE rooms
		SET status = ?, updated_at = ?
		WHERE id = ?
	`
	
	result, err := r.db.ExecContext(ctx, query, status, time.Now(), roomID)
	if err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

// sqliteVoteRepo implements VoteRepository for SQLite
type sqliteVoteRepo struct {
	db dbExecutor
}

func (v *sqliteVoteRepo) Create(ctx context.Context, vote *models.DBUserVote) error {
	query := `
		INSERT INTO votes (id, room_id, user_id, vote_type, option, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(room_id, user_id, vote_type) 
		DO UPDATE SET option = ?, updated_at = ?
	`
	
	now := time.Now()
	_, err := v.db.ExecContext(ctx, query,
		vote.ID,
		vote.RoomID,
		vote.UserID,
		vote.VoteType,
		vote.Option,
		vote.CreatedAt,
		vote.UpdatedAt,
		vote.Option,
		now,
	)
	
	if err != nil {
		return fmt.Errorf("failed to create vote: %w", err)
	}
	
	return nil
}

func (v *sqliteVoteRepo) Get(ctx context.Context, id string) (*models.DBUserVote, error) {
	query := `
		SELECT id, room_id, user_id, vote_type, option, created_at, updated_at
		FROM votes
		WHERE id = ?
	`
	
	var vote models.DBUserVote
	err := v.db.QueryRowContext(ctx, query, id).Scan(
		&vote.ID,
		&vote.RoomID,
		&vote.UserID,
		&vote.VoteType,
		&vote.Option,
		&vote.CreatedAt,
		&vote.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get vote: %w", err)
	}
	
	return &vote, nil
}

func (v *sqliteVoteRepo) GetByRoom(ctx context.Context, roomID string) ([]*models.DBUserVote, error) {
	query := `
		SELECT id, room_id, user_id, vote_type, option, created_at, updated_at
		FROM votes
		WHERE room_id = ?
		ORDER BY created_at DESC
	`
	
	rows, err := v.db.QueryContext(ctx, query, roomID)
	if err != nil {
		return nil, fmt.Errorf("failed to query votes: %w", err)
	}
	defer rows.Close()
	
	var votes []*models.DBUserVote
	for rows.Next() {
		var vote models.DBUserVote
		err := rows.Scan(
			&vote.ID,
			&vote.RoomID,
			&vote.UserID,
			&vote.VoteType,
			&vote.Option,
			&vote.CreatedAt,
			&vote.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan vote: %w", err)
		}
		votes = append(votes, &vote)
	}
	
	return votes, nil
}

func (v *sqliteVoteRepo) GetByRoomAndType(ctx context.Context, roomID string, voteType string) ([]*models.DBUserVote, error) {
	query := `
		SELECT id, room_id, user_id, vote_type, option, created_at, updated_at
		FROM votes
		WHERE room_id = ? AND vote_type = ?
		ORDER BY created_at DESC
	`
	
	rows, err := v.db.QueryContext(ctx, query, roomID, voteType)
	if err != nil {
		return nil, fmt.Errorf("failed to query votes: %w", err)
	}
	defer rows.Close()
	
	var votes []*models.DBUserVote
	for rows.Next() {
		var vote models.DBUserVote
		err := rows.Scan(
			&vote.ID,
			&vote.RoomID,
			&vote.UserID,
			&vote.VoteType,
			&vote.Option,
			&vote.CreatedAt,
			&vote.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan vote: %w", err)
		}
		votes = append(votes, &vote)
	}
	
	return votes, nil
}

func (v *sqliteVoteRepo) Update(ctx context.Context, vote *models.DBUserVote) error {
	query := `
		UPDATE votes
		SET option = ?, updated_at = ?
		WHERE id = ?
	`
	
	now := time.Now()
	result, err := v.db.ExecContext(ctx, query,
		vote.Option,
		now,
		vote.ID,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update vote: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	vote.UpdatedAt = now
	return nil
}

func (v *sqliteVoteRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM votes WHERE id = ?`
	
	result, err := v.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete vote: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (v *sqliteVoteRepo) CountByOption(ctx context.Context, roomID string, voteType string) (map[string]int, error) {
	query := `
		SELECT option, COUNT(*) as count
		FROM votes
		WHERE room_id = ? AND vote_type = ?
		GROUP BY option
	`
	
	rows, err := v.db.QueryContext(ctx, query, roomID, voteType)
	if err != nil {
		return nil, fmt.Errorf("failed to query vote counts: %w", err)
	}
	defer rows.Close()
	
	counts := make(map[string]int)
	for rows.Next() {
		var option string
		var count int
		if err := rows.Scan(&option, &count); err != nil {
			return nil, fmt.Errorf("failed to scan count: %w", err)
		}
		counts[option] = count
	}
	
	return counts, nil
}

// sqliteSessionRepo implements SessionRepository for SQLite
type sqliteSessionRepo struct {
	db dbExecutor
}

func (s *sqliteSessionRepo) Create(ctx context.Context, session *models.SessionData) error {
	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session data: %w", err)
	}
	
	query := `
		INSERT INTO sessions (session_id, agent_name, user_id, room_id, status, data, created_at, updated_at, expires_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	
	_, err = s.db.ExecContext(ctx, query,
		session.SessionID,
		session.AgentName,
		session.UserID,
		session.RoomID,
		session.Status,
		string(data),
		session.CreatedAt,
		session.UpdatedAt,
		session.ExpiresAt,
	)
	
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	
	return nil
}

func (s *sqliteSessionRepo) Get(ctx context.Context, sessionID string) (*models.SessionData, error) {
	query := `
		SELECT data
		FROM sessions
		WHERE session_id = ?
	`
	
	var data string
	err := s.db.QueryRowContext(ctx, query, sessionID).Scan(&data)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	
	var session models.SessionData
	if err := json.Unmarshal([]byte(data), &session); err != nil {
		return nil, fmt.Errorf("failed to unmarshal session data: %w", err)
	}
	
	return &session, nil
}

func (s *sqliteSessionRepo) GetByAgent(ctx context.Context, agentName string) ([]*models.SessionData, error) {
	query := `
		SELECT data
		FROM sessions
		WHERE agent_name = ?
		ORDER BY created_at DESC
	`
	
	rows, err := s.db.QueryContext(ctx, query, agentName)
	if err != nil {
		return nil, fmt.Errorf("failed to query sessions: %w", err)
	}
	defer rows.Close()
	
	var sessions []*models.SessionData
	for rows.Next() {
		var data string
		if err := rows.Scan(&data); err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		
		var session models.SessionData
		if err := json.Unmarshal([]byte(data), &session); err != nil {
			return nil, fmt.Errorf("failed to unmarshal session data: %w", err)
		}
		sessions = append(sessions, &session)
	}
	
	return sessions, nil
}

func (s *sqliteSessionRepo) GetByUser(ctx context.Context, userID string) ([]*models.SessionData, error) {
	query := `
		SELECT data
		FROM sessions
		WHERE user_id = ?
		ORDER BY created_at DESC
	`
	
	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query sessions: %w", err)
	}
	defer rows.Close()
	
	var sessions []*models.SessionData
	for rows.Next() {
		var data string
		if err := rows.Scan(&data); err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		
		var session models.SessionData
		if err := json.Unmarshal([]byte(data), &session); err != nil {
			return nil, fmt.Errorf("failed to unmarshal session data: %w", err)
		}
		sessions = append(sessions, &session)
	}
	
	return sessions, nil
}

func (s *sqliteSessionRepo) GetByRoom(ctx context.Context, roomID string) ([]*models.SessionData, error) {
	query := `
		SELECT data
		FROM sessions
		WHERE room_id = ?
		ORDER BY created_at DESC
	`
	
	rows, err := s.db.QueryContext(ctx, query, roomID)
	if err != nil {
		return nil, fmt.Errorf("failed to query sessions: %w", err)
	}
	defer rows.Close()
	
	var sessions []*models.SessionData
	for rows.Next() {
		var data string
		if err := rows.Scan(&data); err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		
		var session models.SessionData
		if err := json.Unmarshal([]byte(data), &session); err != nil {
			return nil, fmt.Errorf("failed to unmarshal session data: %w", err)
		}
		sessions = append(sessions, &session)
	}
	
	return sessions, nil
}

func (s *sqliteSessionRepo) Update(ctx context.Context, session *models.SessionData) error {
	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session data: %w", err)
	}
	
	query := `
		UPDATE sessions
		SET data = ?, updated_at = ?
		WHERE session_id = ?
	`
	
	result, err := s.db.ExecContext(ctx, query, string(data), time.Now(), session.SessionID)
	if err != nil {
		return fmt.Errorf("failed to update session: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (s *sqliteSessionRepo) Delete(ctx context.Context, sessionID string) error {
	query := `DELETE FROM sessions WHERE session_id = ?`
	
	result, err := s.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (s *sqliteSessionRepo) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM sessions WHERE expires_at < ?`
	
	_, err := s.db.ExecContext(ctx, query, time.Now())
	if err != nil {
		return fmt.Errorf("failed to delete expired sessions: %w", err)
	}
	
	return nil
}

func (s *sqliteSessionRepo) UpdateStatus(ctx context.Context, sessionID string, status string) error {
	query := `
		UPDATE sessions
		SET status = ?, updated_at = ?
		WHERE session_id = ?
	`
	
	result, err := s.db.ExecContext(ctx, query, status, time.Now(), sessionID)
	if err != nil {
		return fmt.Errorf("failed to update session status: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}

func (s *sqliteSessionRepo) UpdateExpiry(ctx context.Context, sessionID string, expiresAt time.Time) error {
	query := `
		UPDATE sessions
		SET expires_at = ?, updated_at = ?
		WHERE session_id = ?
	`
	
	result, err := s.db.ExecContext(ctx, query, expiresAt, time.Now(), sessionID)
	if err != nil {
		return fmt.Errorf("failed to update session expiry: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("not found")
	}
	
	return nil
}