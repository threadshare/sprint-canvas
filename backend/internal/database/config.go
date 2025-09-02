package database

import "time"

// DBConfig represents database configuration
type DBConfig struct {
	Type            string        // "sqlite", "postgres", "mysql"
	DSN             string        // Data Source Name
	MaxOpenConns    int           // Maximum open connections
	MaxIdleConns    int           // Maximum idle connections
	ConnMaxLifetime time.Duration // Maximum connection lifetime
	ConnMaxIdleTime time.Duration // Maximum connection idle time
}