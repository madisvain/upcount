package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/MaMissaoui/fatura/db"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App holds application state and exposes all methods to the frontend.
type App struct {
	ctx    context.Context
	db     *db.Database
	dbPath string
}

// NewApp creates a new App instance.
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. Sets up the database.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	dataDir, err := os.UserConfigDir()
	if err != nil {
		// Fallback to home directory
		dataDir, _ = os.UserHomeDir()
	}

	appDir := filepath.Join(dataDir, "Fatura")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		fmt.Printf("Warning: could not create app dir: %v\n", err)
	}

	a.dbPath = filepath.Join(appDir, "sqlite.db")
	fmt.Printf("Initializing database at: %s\n", a.dbPath)

	database, err := db.NewDatabase(a.dbPath)
	if err != nil {
		fmt.Printf("Failed to initialize database: %v\n", err)
		runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
			Type:    runtime.ErrorDialog,
			Title:   "Database Error",
			Message: fmt.Sprintf("Failed to initialize database at:\n%s\n\n%v\n\nPlease check file permissions and restart.", a.dbPath, err),
		})
		runtime.Quit(ctx)
		return
	}
	a.db = database
	fmt.Println("Database initialized successfully")
}

// ---- Utility ----

// GetVersion returns the application version (used by Sentry on the frontend).
func (a *App) GetVersion() string {
	return "2.0.0-beta.24"
}

// OpenURL opens a URL in the system's default browser.
func (a *App) OpenURL(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

// SaveFile shows a save-file dialog and writes the provided bytes to the chosen path.
// Used by the invoice PDF export feature.
func (a *App) SaveFile(defaultName string, contents []byte) error {
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{DisplayName: "PDF Files (*.pdf)", Pattern: "*.pdf"},
		},
	})
	if err != nil {
		return fmt.Errorf("save dialog: %w", err)
	}
	if path == "" {
		return nil // user cancelled
	}
	return os.WriteFile(path, contents, 0644)
}

// BackupDatabase shows a save-file dialog and copies the SQLite database there.
func (a *App) BackupDatabase() (string, error) {
	defaultName := fmt.Sprintf("fatura-backup-%s.db", time.Now().Format("2006-01-02"))
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{DisplayName: "SQLite Database (*.db)", Pattern: "*.db"},
		},
	})
	if err != nil {
		return "", fmt.Errorf("backup dialog: %w", err)
	}
	if path == "" {
		return "", nil
	}
	if err := copyFile(a.dbPath, path); err != nil {
		return "", fmt.Errorf("backup copy: %w", err)
	}
	return path, nil
}

// RestoreDatabase shows an open-file dialog and replaces the SQLite database.
func (a *App) RestoreDatabase() (string, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Database Backup to Restore",
		Filters: []runtime.FileFilter{
			{DisplayName: "SQLite Database (*.db)", Pattern: "*.db"},
		},
	})
	if err != nil {
		return "", fmt.Errorf("restore dialog: %w", err)
	}
	if path == "" {
		return "", nil
	}

	// Safety backup of current database
	backupPath := a.dbPath + ".backup"
	if _, statErr := os.Stat(a.dbPath); statErr == nil {
		if cpErr := copyFile(a.dbPath, backupPath); cpErr != nil {
			return "", fmt.Errorf("safety backup: %w", cpErr)
		}
	}

	if err := copyFile(path, a.dbPath); err != nil {
		// Try to restore the safety backup
		if _, statErr := os.Stat(backupPath); statErr == nil {
			_ = copyFile(backupPath, a.dbPath)
		}
		return "", fmt.Errorf("restore copy: %w", err)
	}

	// Remove safety backup on success
	_ = os.Remove(backupPath)
	return "Database restored successfully", nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

// ---- Clients ----

func (a *App) GetClients(organizationID string) ([]db.Client, error) {
	return a.db.GetClients(organizationID)
}

func (a *App) GetClient(clientID string) (*db.Client, error) {
	return a.db.GetClient(clientID)
}

func (a *App) CreateClient(req db.CreateClientRequest) (*db.Client, error) {
	return a.db.CreateClient(req)
}

func (a *App) UpdateClient(clientID string, updates db.UpdateClientRequest) (*db.Client, error) {
	return a.db.UpdateClient(clientID, updates)
}

func (a *App) DeleteClient(clientID string) (bool, error) {
	return a.db.DeleteClient(clientID)
}

func (a *App) GetClientInvoiceCount(clientID string) (int64, error) {
	return a.db.GetClientInvoiceCount(clientID)
}

// ---- Invoices ----

func (a *App) GetInvoices(organizationID string) ([]db.Invoice, error) {
	return a.db.GetInvoices(organizationID)
}

func (a *App) GetInvoice(invoiceID string) (*db.Invoice, error) {
	return a.db.GetInvoice(invoiceID)
}

func (a *App) GetInvoiceLineItems(invoiceID string) ([]db.InvoiceLineItem, error) {
	return a.db.GetInvoiceLineItems(invoiceID)
}

func (a *App) CreateInvoice(req db.CreateInvoiceRequest) (*db.Invoice, error) {
	return a.db.CreateInvoice(req)
}

func (a *App) UpdateInvoice(invoiceID string, updates db.UpdateInvoiceRequest) (*db.Invoice, error) {
	return a.db.UpdateInvoice(invoiceID, updates)
}

func (a *App) UpdateInvoiceState(invoiceID string, state string) (*db.Invoice, error) {
	return a.db.UpdateInvoiceState(invoiceID, state)
}

func (a *App) DeleteInvoice(invoiceID string) (bool, error) {
	return a.db.DeleteInvoice(invoiceID)
}

// ---- Organizations ----

func (a *App) GetOrganizations() ([]db.Organization, error) {
	return a.db.GetOrganizations()
}

func (a *App) GetOrganization(organizationID string) (*db.Organization, error) {
	return a.db.GetOrganization(organizationID)
}

func (a *App) CreateOrganization(req db.CreateOrganizationRequest) (*db.Organization, error) {
	return a.db.CreateOrganization(req)
}

func (a *App) UpdateOrganization(organizationID string, updates db.UpdateOrganizationRequest) (*db.Organization, error) {
	return a.db.UpdateOrganization(organizationID, updates)
}

func (a *App) DeleteOrganization(organizationID string) (bool, error) {
	return a.db.DeleteOrganization(organizationID)
}

// ---- Tax Rates ----

func (a *App) GetTaxRates(organizationID string) ([]db.TaxRate, error) {
	return a.db.GetTaxRates(organizationID)
}

func (a *App) GetTaxRate(taxRateID string) (*db.TaxRate, error) {
	return a.db.GetTaxRate(taxRateID)
}

func (a *App) CreateTaxRate(req db.CreateTaxRateRequest) (*db.TaxRate, error) {
	return a.db.CreateTaxRate(req)
}

func (a *App) UpdateTaxRate(taxRateID string, updates db.UpdateTaxRateRequest) (*db.TaxRate, error) {
	return a.db.UpdateTaxRate(taxRateID, updates)
}

func (a *App) DeleteTaxRate(taxRateID string) (bool, error) {
	return a.db.DeleteTaxRate(taxRateID)
}

// ---- Tags ----

func (a *App) GetTags(organizationID string) ([]db.Tag, error) {
	return a.db.GetTags(organizationID)
}

func (a *App) GetTag(tagID string) (*db.Tag, error) {
	return a.db.GetTag(tagID)
}

func (a *App) CreateTag(req db.CreateTagRequest) (*db.Tag, error) {
	return a.db.CreateTag(req)
}

func (a *App) UpdateTag(tagID string, updates db.UpdateTagRequest) (*db.Tag, error) {
	return a.db.UpdateTag(tagID, updates)
}

func (a *App) DeleteTag(tagID string) (bool, error) {
	return a.db.DeleteTag(tagID)
}

// ---- Time Entries ----

func (a *App) GetTimeEntries(organizationID string) ([]db.TimeEntry, error) {
	return a.db.GetTimeEntries(organizationID)
}

func (a *App) GetTimeEntry(timeEntryID string) (*db.TimeEntry, error) {
	return a.db.GetTimeEntry(timeEntryID)
}

func (a *App) CreateTimeEntry(req db.CreateTimeEntryRequest) (*db.TimeEntry, error) {
	return a.db.CreateTimeEntry(req)
}

func (a *App) UpdateTimeEntry(timeEntryID string, updates db.UpdateTimeEntryRequest) (*db.TimeEntry, error) {
	return a.db.UpdateTimeEntry(timeEntryID, updates)
}

func (a *App) DeleteTimeEntry(timeEntryID string) (bool, error) {
	return a.db.DeleteTimeEntry(timeEntryID)
}

// ---- Projects ----

func (a *App) GetProjects(organizationID string) ([]db.Project, error) {
	return a.db.GetProjects(organizationID)
}

func (a *App) GetProject(projectID string) (*db.Project, error) {
	return a.db.GetProject(projectID)
}

func (a *App) CreateProject(req db.CreateProjectRequest) (*db.Project, error) {
	return a.db.CreateProject(req)
}

func (a *App) UpdateProject(projectID string, updates db.UpdateProjectRequest) (*db.Project, error) {
	return a.db.UpdateProject(projectID, updates)
}
