# Changelog Management

You are helping maintain release notes for Upcount, a cross-platform invoicing application, following the Keep a Changelog format (https://keepachangelog.com/en/1.1.0/).

## Workflow

When asked to create release notes:

1. **Accept version parameter** (optional)
   - If version provided (e.g., "v1.2.0" or "1.2.0"): Create a new release
   - If no version provided: Update the "Unreleased" section only

2. **Review recent commits**
   ```bash
   # First, find the latest release tag
   git tag --sort=-version:refname | head -1
   
   # Then get commits since that tag (replace with actual tag)
   git log --oneline --no-merges [LATEST_TAG]..HEAD
   
   # Example for this project:
   git log --oneline --no-merges v2.0.0-beta.5..HEAD
   ```

3. **Update CHANGELOG.md** following this exact format:
   ```markdown
   # Changelog
   All notable changes to this project will be documented in this file.

   The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
   and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

   ## [Unreleased]

   ## [X.X.X] - YYYY-MM-DD
   ### Added
   - New features

   ### Changed
   - Changes in existing functionality

   ### Deprecated
   - Soon-to-be removed features

   ### Removed
   - Now removed features

   ### Fixed
   - Bug fixes

   ### Security
   - Vulnerability fixes
   ```

4. **Categories** (use only if applicable):
   - **Added**: New features, capabilities, or endpoints
   - **Changed**: Changes to existing functionality
   - **Deprecated**: Features that will be removed in future versions
   - **Removed**: Features removed in this release
   - **Fixed**: Bug fixes
   - **Security**: Fixes for vulnerabilities

5. **Guidelines**:
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

6. **Version links** (at bottom of file):
   ```markdown
   [unreleased]: https://github.com/username/upcount/compare/vX.X.X...HEAD
   [X.X.X]: https://github.com/username/upcount/compare/vX.X.X-1...vX.X.X
   ```

## Example Commands

- `Create release notes for v1.2.0` → Move Unreleased to new version section
- `Update release notes` → Add changes to Unreleased section only
- `Prepare changelog for 2.0.0` → Major version release

## Release Process

When releasing a version:
1. Move all "Unreleased" entries to the new version section
2. Add the version number and today's date
3. Clear the "Unreleased" section (keep the heading)
4. Update comparison links at the bottom
5. Commit with message: "Release version X.X.X"
6. **Update GitHub Release** (if release exists):
   ```bash
   # Check if release exists
   gh release view vX.X.X --repo madisvain/upcount
   
   # If it exists, update the release notes
   gh release edit vX.X.X --repo madisvain/upcount --notes-file release-notes.md
   ```
   
   Where `release-notes.md` contains the changelog section for that version.

## Good Examples

### Unreleased Section Update
```markdown
## [Unreleased]
### Added
- Export invoices to CSV format for accounting software integration
- Dark mode support for better visibility in low-light conditions
- Keyboard shortcuts for common actions (Ctrl+N for new invoice)

### Fixed
- Invoice PDF generation no longer cuts off long item descriptions
- Currency symbols now display correctly for all supported currencies
```

### Version Release
```markdown
## [1.2.0] - 2025-06-29
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