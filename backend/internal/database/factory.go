package database

import (
	"context"
	"database/sql"
	"fmt"
	
	_ "github.com/mattn/go-sqlite3"
)

// NewSQLiteDatabase creates a new SQLite database instance
func NewSQLiteDatabase(config *DBConfig) (Database, error) {
	if config.DSN == "" {
		config.DSN = "foundation_sprint.db"
	}
	
	// Open database connection
	db, err := sql.Open("sqlite3", config.DSN)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	
	// Configure connection pool
	if config.MaxOpenConns > 0 {
		db.SetMaxOpenConns(config.MaxOpenConns)
	} else {
		db.SetMaxOpenConns(1) // SQLite typically uses 1 connection
	}
	
	if config.MaxIdleConns > 0 {
		db.SetMaxIdleConns(config.MaxIdleConns)
	}
	
	if config.ConnMaxLifetime > 0 {
		db.SetConnMaxLifetime(config.ConnMaxLifetime)
	}
	
	return &sqliteDB{
		db:     db,
		config: config,
	}, nil
}

// sqliteDB implements the Database interface for SQLite
type sqliteDB struct {
	db     *sql.DB
	config *DBConfig
}

func (s *sqliteDB) Connect(ctx context.Context) error {
	return s.Ping(ctx)
}

func (s *sqliteDB) Close() error {
	return s.db.Close()
}

func (s *sqliteDB) Ping(ctx context.Context) error {
	return s.db.PingContext(ctx)
}

func (s *sqliteDB) BeginTx(ctx context.Context) (Transaction, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	
	return &sqliteTx{tx: tx, db: s.db}, nil
}

func (s *sqliteDB) Rooms() RoomRepository {
	return &sqliteRoomRepo{db: s.db}
}

func (s *sqliteDB) Votes() VoteRepository {
	return &sqliteVoteRepo{db: s.db}
}

func (s *sqliteDB) Sessions() SessionRepository {
	return &sqliteSessionRepo{db: s.db}
}

func (s *sqliteDB) Migrate(ctx context.Context) error {
	migrations := []string{
		// Rooms table
		`CREATE TABLE IF NOT EXISTS rooms (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			created_by TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			status TEXT DEFAULT 'foundation',
			foundation_data TEXT,
			differentiation_data TEXT,
			approach_data TEXT
		)`,
		
		// Votes table
		`CREATE TABLE IF NOT EXISTS votes (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			user_id TEXT NOT NULL,
			vote_type TEXT NOT NULL,
			option TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
			UNIQUE(room_id, user_id, vote_type)
		)`,
		
		// Sessions table
		`CREATE TABLE IF NOT EXISTS sessions (
			session_id TEXT PRIMARY KEY,
			agent_name TEXT NOT NULL,
			user_id TEXT,
			room_id TEXT,
			status TEXT NOT NULL,
			data TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			expires_at TIMESTAMP NOT NULL
		)`,
		
		// Indexes
		`CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by)`,
		`CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status)`,
		`CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id)`,
		`CREATE INDEX IF NOT EXISTS idx_votes_room_type ON votes(room_id, vote_type)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_name)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_room ON sessions(room_id)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`,
	}
	
	for _, migration := range migrations {
		if _, err := s.db.ExecContext(ctx, migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}
	
	return nil
}

// sqliteTx implements the Transaction interface
type sqliteTx struct {
	tx *sql.Tx
	db *sql.DB
}

func (t *sqliteTx) Commit() error {
	return t.tx.Commit()
}

func (t *sqliteTx) Rollback() error {
	return t.tx.Rollback()
}

func (t *sqliteTx) Rooms() RoomRepository {
	return &sqliteRoomRepo{db: t.tx}
}

func (t *sqliteTx) Votes() VoteRepository {
	return &sqliteVoteRepo{db: t.tx}
}

func (t *sqliteTx) Sessions() SessionRepository {
	return &sqliteSessionRepo{db: t.tx}
}

// dbExecutor interface for both *sql.DB and *sql.Tx
type dbExecutor interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
}