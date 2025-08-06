# Changelog Management

You are helping maintain the CHANGELOG.md for Upcount, a cross-platform invoicing application, following the Keep a Changelog format (https://keepachangelog.com/en/1.1.0/).

## Workflow

When asked to update the changelog:

1. **Always start from the latest release**
   ```bash
   # Find the latest release tag
   git tag --sort=-version:refname | head -1
   
   # Get all commits since that tag
   git log --oneline --no-merges [LATEST_TAG]..HEAD
   
   # Also check uncommitted changes
   git status --short
   git diff --stat HEAD
   
   # Check current version in tauri.conf.json to determine next version
   cat src-tauri/tauri.conf.json | grep '"version"'
   ```

2. **Update CHANGELOG.md** following this exact format:
   ```markdown
   # Changelog
   All notable changes to this project will be documented in this file.

   The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
   and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

   ## [2.0.0-beta.20] - Unreleased
   ### Added
   - New features

   ### Changed
   - Changes in existing functionality

   ### Fixed
   - Bug fixes

   ## [2.0.0-beta.19] - 2025-08-06
   ### Added
   - Previous release features
   ```
   
   **Important Rules**: 
   - If the top version says "Unreleased", ADD to that existing version
   - Only create a new version number when the previous one has a date (meaning it was released)
   - The date will be set manually when releasing - you should always use "Unreleased"
   - Check tauri.conf.json for the current version to determine the next version number when needed

3. **Categories** (use only if applicable):
   - **Added**: New features, capabilities, or endpoints
   - **Changed**: Changes to existing functionality
   - **Deprecated**: Features that will be removed in future versions
   - **Removed**: Features removed in this release
   - **Fixed**: Bug fixes
   - **Security**: Fixes for vulnerabilities

4. **Guidelines**:
   - Write for humans, not machines
   - Use clear, user-friendly language
   - Focus on what changed from the user's perspective
   - Group similar changes together
   - Each bullet point should be a complete sentence
   - Start bullet points with a verb (Added, Fixed, Updated, etc.)
   - Don't include implementation details unless necessary
   - Omit empty sections
   - Most recent version at the top
   - Date format: YYYY-MM-DD (ISO 8601)
   - Always check both committed and uncommitted changes since last release

5. **Version links** (at bottom of file):
   ```markdown
   [unreleased]: https://github.com/madisvain/upcount/compare/vX.X.X...HEAD
   [X.X.X]: https://github.com/madisvain/upcount/compare/vX.X.X-1...vX.X.X
   ```

## Example Usage

- `Update changelog` → Review all changes since last release and update CHANGELOG.md
- `Update release notes` → Same as above
- `/changelog` → Review and update based on recent changes

## Good Examples

### Current Development Version
```markdown
## [2.0.0-beta.20] - Unreleased
### Added
- Export invoices to CSV format for accounting software integration
- Dark mode support for better visibility in low-light conditions
- Keyboard shortcuts for common actions (Ctrl+N for new invoice)

### Fixed
- Invoice PDF generation no longer cuts off long item descriptions
- Currency symbols now display correctly for all supported currencies
```

### Released Version
```markdown
## [2.0.0-beta.19] - 2025-08-06
### Added
- Multi-language support for invoices (English, Spanish, French, German)
- Automatic tax calculation based on client location
- Bulk invoice operations (mark as paid, delete, export)

### Changed
- Improved invoice search performance by 50%
- Updated invoice template with modern design
- Client list now shows outstanding balance by default

### Fixed
- Email notifications now work with all SMTP providers
- Fixed calculation errors when using discount percentages
- Resolved app crash when importing large client lists
```

## Common Pitfalls to Avoid

- ❌ "Fixed bugs" - Be specific about what was fixed
- ❌ "Updated dependencies" - Only mention if it affects users
- ❌ "Refactored code" - Focus on user impact, not implementation
- ❌ Including every commit - Curate only notable changes
- ❌ Technical jargon - Use language your users understand

## Remember

The changelog is a curated list of **notable** changes, not a git log dump. Focus on what matters to users. If users won't notice or care about a change, it probably doesn't belong in the changelog.