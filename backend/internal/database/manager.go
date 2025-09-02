package database

import (
	"context"
	"fmt"
	"os"
	"sync"
)

var (
	instance Database
	once     sync.Once
	initErr  error
)

// GetDatabase returns the singleton database instance
func GetDatabase() (Database, error) {
	once.Do(func() {
		instance, initErr = initializeDatabase()
	})
	return instance, initErr
}

// initializeDatabase creates and initializes the database
func initializeDatabase() (Database, error) {
	// Get database type from environment
	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "sqlite"
	}
	
	var db Database
	var err error
	
	switch dbType {
	case "sqlite":
		config := &DBConfig{
			Type: "sqlite",
			DSN:  os.Getenv("SQLITE_DSN"),
		}
		if config.DSN == "" {
			config.DSN = "foundation_sprint.db"
		}
		
		db, err = NewSQLiteDatabase(config)
		if err != nil {
			return nil, fmt.Errorf("failed to create SQLite database: %w", err)
		}
		
	// Future database types can be added here
	// case "postgres":
	//     db, err = postgres.NewPostgresDB(config)
	// case "mysql":
	//     db, err = mysql.NewMySQLDB(config)
		
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}
	
	// Connect to database
	ctx := context.Background()
	if err := db.Connect(ctx); err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	
	// Run migrations
	if err := db.Migrate(ctx); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}
	
	return db, nil
}

// SetDatabase sets the database instance (useful for testing)
func SetDatabase(db Database) {
	instance = db
}

// ResetDatabase resets the singleton (useful for testing)
func ResetDatabase() {
	once = sync.Once{}
	instance = nil
	initErr = nil
}