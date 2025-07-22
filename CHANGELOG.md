# Changelog

All notable changes to Upcount will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Invoice number generation error when no format is configured (prevents "null is not an object" error)
- Sentry sourcemap uploads in CI/CD builds by adding authentication token to GitHub Actions workflow

### Changed
- Invoice number generation now returns empty string instead of crashing when format is not configured
- Enhanced Sentry integration with release tracking and explicit sourcemap configuration

## [2.0.0-beta.11] - 2025-07-18

### Changed
- Invoice numbers now display without zero-padding (e.g., "1" instead of "00001")
- Cleaned up invoice settings UI by removing obsolete prefix/suffix fields in favor of flexible format templates

## [2.0.0-beta.10] - 2025-07-17

### Fixed
- Tax rate creation now properly converts percentage strings to numbers before database storage
- Default tax rate selection automatically applies to new invoices and line items
- Only one tax rate can be marked as default per organization through transaction support

### Changed
- Improved tax rate field handling in invoice forms for better data consistency

## [2.0.0-beta.9] - 2025-07-14

### Added
- Complete project management system with create, edit, archive, and search functionality
- Project association to time tracking entries with intelligent client/project selection
- Time tracking reports page with filtering, grouping, and export capabilities
- Project status management (Active/Archived) with visual indicators
- Complete translations for all missing strings (400+ new translations across 8 languages)
- Comprehensive SEO improvements for the new Astro-based website
- Platform-specific download links and sitemap integration for better discoverability

### Changed
- Refactored database.rs into modular structure using modern Rust 2018+ patterns
- Improved time tracking reports with enhanced filtering and user interface
- Optimized website performance by fixing render blocking requests and LCP image loading
- Enhanced navigation with dedicated reports section
- Updated default window height for better user experience

### Fixed
- Projects page client display now properly fetches and shows client names using SQL JOIN
- TimeEntryForm suspension error when stopping timer resolved
- Form conflicts in TimeRangeCell component eliminated
- Memory allocation issues in development builds
- Invoice settings component cleanup and optimization

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
