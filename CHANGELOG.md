# Changelog

All notable changes to Upcount will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete translations for 7 additional languages: German, Finnish, French, Dutch, Swedish, Ukrainian, and Portuguese
- Enhanced language dropdown with flag emojis for better visual identification
- Improved language selector UX with compact flag-only display in header

### Changed
- Language dropdown now auto-sizes to fit content properly without truncation
- Updated README.md to reflect all 9 supported languages (English, German, Estonian, Finnish, French, Dutch, Portuguese, Swedish, Ukrainian)

### Fixed
- Language dropdown width issues resolved with proper Ant Design props
- Removed invalid yarn add-locale command from documentation

## [2.0.0-beta.5] - 2025-06-29

### Added
- Automatic invoice numbering with configurable options
- Auto-updater functionality with Tauri plugin
- Backup and restore functionality for data safety
- Sentry error tracking for better crash diagnostics
- Client delete functionality
- Migrated from tauri-plugin-sql to pure SQLx for all database operations

### Fixed
- Production build migration loading issue
- macOS crash issues with Sentry error tracking
- TypeScript errors in backup error handling
- React Hook useEffect dependency warnings
- Ant Design Descriptions deprecated props
- Invoice delete functionality
- Invoice creation and legacy column cleanup
- TypeScript build errors in organization atom
- Tauri v2 permissions for devtools and core functionality

### Changed
- Migrated from tauri-plugin-sql to pure SQLx for all database operations
- Upgraded from Tauri v1 to v2
- Improved backup page UI layout and responsiveness
- Updated dependencies including:
  - Vite from v5.4.19 to v6.3.5
  - ESLint from v8.57.1 to v9.29.0
  - TypeScript ESLint from v6.14.0 to v8.34.1
  - React Router from v6.30.1 to v7.6.2
  - react-pdf from v8 to v9.2.1
  - LinguiJS from v4 to v5
  - @react-pdf/renderer from 3.4.5 to 4.3.0
  - @ant-design/icons from 5.6.1 to 6.0.0
- Limited publish workflow to tauri.conf.json changes
- Updated README for beta release
- Fixed GitHub Actions badge URL
