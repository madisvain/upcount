# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Upcount is a cross-platform invoicing application built with Tauri, React, and SQLite. The app is designed to be offline-first for privacy and supports multiple languages via LinguiJS.

## Architecture
- **Frontend**: React 18 with TypeScript and Vite
- **UI Framework**: Ant Design components
- **State Management**: Jotai atoms for reactive state
- **Backend**: Tauri (Rust) with SQLite database via tauri-plugin-sql
- **Styling**: SCSS with Ant Design theming
- **Internationalization**: LinguiJS with .po files in src/locales/
- **PDF Generation**: @react-pdf/renderer for invoice PDFs

## Key Technologies
- Tauri 1.7.1 for desktop app framework
- React Router 6 for navigation
- Jotai for state management with atoms in src/atoms.tsx
- LinguiJS for i18n with macros for translations
- SQLite with migrations in src-tauri/migrations/

## Development Commands
```bash
# Start development server (runs both Tauri and Vite)
npm run dev

# Build for production
npm run build

# Lint TypeScript/React code
npm run lint

# Extract translation strings
npm run extract

# Add new locale (replace 'de' with language code)
npm run add-locale de
```

## File Structure
- `src/routes/` - Main application pages
- `src/components/` - Reusable React components
- `src/atoms.tsx` - Jotai state atoms and database operations
- `src/layouts/base.tsx` - Main application layout
- `src/utils/` - Utility functions including lingui.tsx for i18n
- `src-tauri/` - Rust backend code and SQLite migrations
- `src/locales/` - Translation files (.po format)

## Database
SQLite database operations are handled through Tauri's SQL plugin with atoms in atoms.tsx. Database schema migrations are in src-tauri/migrations/ and applied automatically.

## State Management
Uses Jotai atoms pattern with:
- Storage atoms for persistence (localeAtom, siderAtom)
- Database-connected atoms for entities (clientsAtom, invoicesAtom, etc.)
- Setter atoms for database operations (setClientsAtom, etc.)

## Internationalization
- Uses LinguiJS with macro-based extraction
- Translation files in .po format under src/locales/
- Default locale configuration in src/utils/lingui.tsx
- Currently supports: English (en), Estonian (et)

## Build Process
Tauri handles the build process:
- Frontend builds with Vite to dist/
- Rust backend compiles with Cargo
- Final app bundle includes SQLite database