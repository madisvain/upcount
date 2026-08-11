
# Upcount invoicing & time tracking app

![Github actions](https://github.com/madisvain/upcount/workflows/publish/badge.svg) ![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/madisvain/upcount?include_prereleases) ![GitHub](https://img.shields.io/github/license/madisvain/upcount)


## 🔒 Local-First & Privacy Focused

**Your data belongs to you.** Upcount is designed to work completely offline - no internet connection required. All your invoices, clients, and business data are stored locally on your computer in an SQLite database. No cloud servers, no subscriptions, no data mining. You own and control all your data.

Built with [Tauri](https://tauri.app/), [SQLite](https://www.sqlite.org/index.html), [React](https://reactjs.org/), and [Ant Design](https://ant.design/)

![Invoice list](https://www.upcount.app/screenshots/invoices.png)
[Invoice editing](https://www.upcount.app/screenshots/invoice-edit.png)
[Invoice settings](https://www.upcount.app/screenshots/settings.png)

## Governed AI access (optional)

Upcount is local-first with no API, so the only ways an AI assistant could *operate* it today are
screen-scraping or raw SQLite access — both ungoverned. The optional [`kriya-mcp/`](kriya-mcp/)
integration instead exposes Upcount's existing actions to an assistant (e.g. Claude Desktop) as a
**governed MCP server**:

- **Reads** (clients, invoices, time entries) run freely.
- **Routine writes** (create/update clients, tax rates, tags, projects, time entries) are recorded in a signed audit log.
- **Money & destructive** actions (create/update/issue an invoice, and any `delete_*`) pause for **human approval**.
- A per-minute **budget** caps a runaway agent; anything not allow-listed is **denied by default**.

It's **off by default** and changes nothing in the app: the `kriya_exec` helper binary reuses the
exact async `Database` methods the UI already calls, and all governance lives in the external
`kriya-mcp` process. See [`kriya-mcp/README.md`](kriya-mcp/README.md) to enable it.

## Download

Upcount is available for Mac, Linux & Windows and can be downloaded from Github releases.

**[https://github.com/madisvain/upcount/releases](https://github.com/madisvain/upcount/releases)**

# Features
* 🎯 Totally free & Open source
* 📄 Invoicing with automatic numbering
* ⏱️ Complete time tracking with timer and reports
* 📊 Project management with status tracking
* 👥 Client management
* 👾 Use your own logo
* 🍭 Customizable settings
* 🎭 Cross platform
* ⚡️ Offline-first for privacy
* 🌐 Internationalized (10 languages)
* 💾 Backup and restore functionality
* ©️ [GPLv3 License](https://github.com/madisvain/upcount/blob/main/LICENSE)

# Languages
* 🇬🇧 English
* 🇩🇪 German
* 🇪🇪 Estonian
* 🇫🇮 Finnish
* 🇫🇷 French
* 🇬🇷 Greek
* 🇳🇱 Dutch
* 🇵🇹 Portuguese
* 🇸🇪 Swedish
* 🇺🇦 Ukrainian

If you are interested in adding a language translation to Upcount [please open a new issue](https://github.com/madisvain/upcount/issues).

For developers the following commands are needed to add a language.

```shell
pnpm extract
```

Then manually create the new locale file by copying an existing .po file in the locales folder and translating the strings.

The translations are stored in .po files under [locales](https://github.com/madisvain/upcount/tree/main/src/locales) folder. A cross platform app named [POEdit](https://poedit.net/) could be used for translating them.

## Bugs and Feature Requests

Have a bug or a feature request? First, read the [issue guidelines](https://github.com/madisvain/upcount/blob/main/CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/madisvain/upcount/issues).

For more generic product questions and feedback please email [hello@upcount.app](mailto:hello@upcount.app)


## Contributors

[<img alt="madisvain" src="https://avatars.githubusercontent.com/u/727994?v=4&s=100" width="100">](https://github.com/madisvain) |[<img alt="stgeipel" src="https://avatars.githubusercontent.com/u/46808966?v=4&s=100" width="100">](https://github.com/stgeipel) |[<img alt="koen860" src="https://avatars.githubusercontent.com/u/1337450?v=4&s=100" width="100">](https://github.com/koen860) |[<img alt="KurtMar" src="https://avatars.githubusercontent.com/u/10009649?v=4&s=100" width="100">](https://github.com/KurtMar) |[<img alt="hrenard" src="https://avatars.githubusercontent.com/u/7594435?v=4&s=100" width="100">](https://github.com/hrenard) |
:---:|:---:|:---:|:---:|:---:|
[madisvain](https://github.com/madisvain)|[stgeipel](https://github.com/stgeipel)|[koen860](https://github.com/koen860)|[KurtMar](https://github.com/KurtMar)|[hrenard](https://github.com/hrenard)|

## License

[GPLv3 License](https://github.com/madisvain/upcount/blob/main/LICENSE) &copy; [Upcount](https://upcount.app)
