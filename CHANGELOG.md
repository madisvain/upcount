# Changelog

All notable changes to Upcount will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-beta.8] - 2025-07-08

### Added
- Complete translations for all supported languages achieving 100% coverage (184/184 strings)

### Changed
- Disabled Sentry telemetry for enhanced privacy
- Cleaned up obsolete translation entries across all locale files for better maintainability

### Fixed
- JavaScript heap out of memory errors in GitHub Actions macOS builds by increasing Node.js memory allocation to 4GB
- Invoice state translations now display correctly in invoice list view using proper Trans components

## [2.0.0-beta.7] - 2025-07-05

### Added
- Ability to clear/unset tax rates on invoice line items with new clear button
- Precise decimal arithmetic using decimal.js library for all financial calculations

### Fixed
- Floating-point precision errors in invoice calculations (e.g. 0.1234 × 1000 now correctly shows 123.4 instead of 123.39999999999999)
- Tax calculations now use precise percentage calculations instead of floating-point arithmetic
- Invoice total calculations (subtotal + tax) now use precise decimal addition
- Form field calculations for quantity, price, and total now maintain precision during updates
- Added safety checks for missing tax rate percentages to prevent calculation errors

## [2.0.0-beta.6] - 2025-07-02

### Added
- Complete time tracking feature with start/stop timer functionality
- Global timer widget in header that persists across app navigation
- Inline editing for time entry descriptions and client assignments
- Time range editing with popover containing time pickers and date selector
- Persistent running timer that restores automatically on app restart
- Invoice duplication feature for quickly creating similar invoices
- Complete translations for 7 additional languages: German, Finnish, French, Dutch, Swedish, Ukrainian, and Portuguese
- Enhanced language dropdown with flag emojis for better visual identification
- Improved language selector UX with compact flag-only display in header
- Client code field for invoice numbering and invoice organization
- Jotai DevTools integration for better state debugging in development

### Changed
- Time tracking interface with streamlined table columns (tags visible, billable temporarily hidden)
- Time entry form simplified with core fields (description, client, time range, duration, tags)
- Language dropdown now auto-sizes to fit content properly without truncation
- Organization switching preserves current page to eliminate navigation flicker
- Updated README.md to reflect all 9 supported languages (English, German, Estonian, Finnish, French, Dutch, Portuguese, Swedish, Ukrainian)
- Refactored atoms into organized directory structure for better code maintainability
- Enhanced Sentry integration with frontend error tracking

### Fixed
- Time entry edit button in actions dropdown now works without page refresh
- Empty time entry descriptions now display placeholder text for better clickability
- Organization switching no longer causes UI flicker with improved loading states
- Language dropdown width issues resolved with proper Ant Design props
- Removed invalid yarn add-locale command from documentation
- App loading issues after atom refactoring resolved
- Language preference persistence now works correctly across app restarts

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
