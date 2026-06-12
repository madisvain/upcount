package db

import (
	"embed"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// Database holds the SQLite connection pool.
type Database struct {
	DB     *sqlx.DB
	DBPath string
}

// NewDatabase opens (or creates) the SQLite database at dbPath, runs all
// pending migrations and returns a ready-to-use Database.
func NewDatabase(dbPath string) (*Database, error) {
	// Embed pragmas in the DSN so every connection gets them automatically,
	// regardless of pool size. busy_timeout avoids SQLITE_BUSY under load.
	dsn := dbPath + "?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)"
	db, err := sqlx.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	// SQLite performs best with a single writer connection.
	db.SetMaxOpenConns(1)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping database: %w", err)
	}

	d := &Database{DB: db, DBPath: dbPath}
	if err := d.runMigrations(); err != nil {
		return nil, fmt.Errorf("run migrations: %w", err)
	}

	return d, nil
}

// Backup creates a consistent single-file snapshot via VACUUM INTO,
// safe to call while the database is open in WAL mode.
func (d *Database) Backup(destPath string) error {
	_ = os.Remove(destPath) // VACUUM INTO fails if the destination already exists
	if _, err := d.DB.Exec("VACUUM INTO ?", destPath); err != nil {
		return fmt.Errorf("backup: %w", err)
	}
	return nil
}

// Close shuts down the connection pool.
func (d *Database) Close() error {
	return d.DB.Close()
}

func (d *Database) runMigrations() error {
	sourceDriver, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return fmt.Errorf("create migration source: %w", err)
	}

	dbDriver, err := sqlite.WithInstance(d.DB.DB, &sqlite.Config{})
	if err != nil {
		return fmt.Errorf("create migration db driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", sourceDriver, "sqlite", dbDriver)
	if err != nil {
		return fmt.Errorf("create migrator: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("apply migrations: %w", err)
	}

	return nil
}
