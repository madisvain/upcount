# Translation Management

You are helping maintain translations for Upcount, a cross-platform invoicing application. The app uses LinguiJS with .po files for internationalization.

## Overview

The translation system uses:
- **Source language**: English (en.po) - always complete
- **Target languages**: Estonian (et.po), and potentially others
- **Format**: GNU gettext .po files

## Workflow

When asked to update translations:

1. **Extract and analyze current translation status**
   ```bash
   yarn extract
   ```
   This command will:
   - Extract all translatable strings from the source code
   - Update catalog files with new messages
   - Show a table with total count and missing translations for each language
   - Identify which languages need translation updates

2. **Identify locale files**
   ```bash
   ls src/locales/*.po | grep -v en.po
   ```

3. **Analyze missing translations**
   For each locale file that has missing translations (excluding en.po):
   ```bash
   # Count empty translations
   grep -c 'msgstr ""' src/locales/et.po
   
   # Show first few missing translations with context
   grep -B1 'msgstr ""' src/locales/et.po | head -20
   ```

4. **Extract missing translations**
   Read the locale file and identify all entries where `msgstr ""` (empty translation).
   For each missing translation, note:
   - The msgid (source text in English)
   - The file location comment (shows where it's used)
   - Any context that might help with translation

5. **Translate missing strings**
   - Translate each msgid to the target language
   - Maintain the tone and style appropriate for a business/invoicing application
   - Keep translations concise and professional
   - Preserve any formatting or placeholders in the original text

6. **Update the .po file**
   Fill in the empty msgstr fields with appropriate translations.

7. **Verify completeness**
   Run `yarn extract` again to confirm all translations are complete and the "Missing" column shows 0 for all languages.

## Translation Guidelines

### General Rules
- Keep translations natural and idiomatic in the target language
- Maintain consistency with existing translations
- Preserve any variables or placeholders (e.g., {count}, %s)
- Don't translate technical terms that are commonly used in English
- Keep UI labels short and clear

### Context Awareness
- Check the file location comment to understand where the text is used
- Consider the UI context (button, label, message, etc.)
- For Estonian specifically:
  - Use informal language (sina-vorm) for user-facing messages
  - Keep terminology consistent with common Estonian software conventions

### Common Patterns
- **Buttons**: Use imperative mood (e.g., "Save" → "Salvesta")
- **Labels**: Use nominative case (e.g., "Name" → "Nimi")
- **Messages**: Full sentences with proper punctuation
- **Errors**: Clear, helpful messages that guide the user

## Example Commands

- `Update Estonian translations` → Fill all missing translations in et.po
- `Translate missing strings to Estonian` → Same as above
- `Check translation status` → Show statistics about translation completeness

## Example Translation Process

```po
# Before (missing translation)
#: src/routes/settings/invoice.tsx:223
msgid "2-digit month"
msgstr ""

# After (translated)
#: src/routes/settings/invoice.tsx:223
msgid "2-digit month"
msgstr "2-kohaline kuu"
```

## Special Considerations

### Plurals
When encountering plural forms, use the appropriate plural rules for the target language:
```po
msgid "One item"
msgid_plural "%d items"
msgstr[0] "Üks toode"
msgstr[1] "%d toodet"
```

### Format Strings
Preserve all format specifiers and variables:
```po
msgid "Welcome, {name}!"
msgstr "Tere tulemast, {name}!"
```

### UI Space Constraints
Consider that translations might be longer than English. Keep button and label translations concise.

## Quality Checks

After translating:
1. Verify all empty msgstr fields are filled
2. Check that all format specifiers are preserved
3. Ensure consistency with existing translations
4. Review for grammar and spelling

## Tools Integration

The project uses:
- `yarn extract` - Extract new strings from source code
- `yarn add-locale [code]` - Add a new language
- Standard .po editors can be used for manual editing

Remember: Good translations make the software feel native to users. Take care to produce natural, accurate translations that respect the target language's conventions.