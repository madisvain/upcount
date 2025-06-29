
# 📣 Version 2

Happy to announce that I'm nearing the long overdue release of Upcount with improved functionality. The new version is a complete rewrite of the application with a focus on performance and stability.

NB! It's not backwards compatible with Upcount version 1 and will require a new installation. The beta version is backward compatible with alpha releases.

## 🚀 [Upcount 2.0.0-beta.1](https://github.com/madisvain/upcount/releases/latest)

The beta version is now available on the main branch of the repository.

The new version is built with

* [Tauri](https://tauri.app/)
* [SQLite](https://www.sqlite.org/index.html)
* [React](https://reactjs.org/)
* [Ant Design](https://ant.design/)

I'd be happy to receive feedback on this new version and any feature requests you might have. Please open an issue on Github or email me at [madisvain@gmail.com](mailto:madisvain@gmail.com).


# Upcount invoicing app

![Github actions](https://github.com/madisvain/upcount/workflows/publish/badge.svg) ![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/madisvain/upcount?include_prereleases) ![GitHub](https://img.shields.io/github/license/madisvain/upcount)

![Invoice list](https://www.upcount.app/screenshots/invoices.png)
[Invoice editing](https://www.upcount.app/screenshots/invoice-edit.png)
[Invoice settings](https://www.upcount.app/screenshots/settings.png)

## Download

Upcount is available for Mac, Linux & Windows and can be downloaded from Github releases.

**[https://github.com/madisvain/upcount/releases](https://github.com/madisvain/upcount/releases)**

# Features
* 🎯 Totally free & Open source
* 🎭 Cross platform
* ⚡️ Offline-first for privacy
* 👾 Use your own logo
* 🍭 Customizable settings
* 🌐 Internationalized
* ©️ [GPLv3 License](https://github.com/madisvain/upcount/blob/main/LICENSE)

# Languages
* 🇬🇧 English
* 🇩🇪 German
* 🇪🇪 Estonian
* 🇫🇮 Finnish
* 🇫🇷 French
* 🇳🇱 Dutch
* 🇸🇪 Swedish
* 🇺🇦 Ukrainian

If you are interested in adding a language translation to Upcount [please open a new issue](https://github.com/madisvain/upcount/issues).

For developers the following commands are needed to add a language.

```shell
npm run add-locale de
npm run extract
```

_`de` must be replaced with the language code you are adding._

The translations are stored in .po files under [locales](https://github.com/madisvain/upcount/tree/main/src/locales) folder. A cross platform app named [POEdit](https://poedit.net/) could be used for translating them.

## Bugs and Feature Requests

Have a bug or a feature request? First, read the [issue guidelines](https://github.com/madisvain/upcount/blob/main/CONTRIBUTING.md#using-the-issue-tracker) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/madisvain/upcount/issues).

For more generic product questions and feedback please email [hello@upcount.app](mailto:hello@upcount.app)


## Contributors

[<img alt="madisvain" src="https://avatars2.githubusercontent.com/u/727994?v=4&s=200" width="100">](https://github.com/madisvain) |[<img alt="stgeipel" src="https://avatars3.githubusercontent.com/u/46808966?v=4&s=200" width="100">](https://github.com/stgeipel) |[<img alt="KurtMar" src="https://avatars1.githubusercontent.com/u/10009649?v=4&s=200" width="100">](https://github.com/KurtMar) |
:---:|:---:|:---:|
[madisvain](https://github.com/madisvain)|[stgeipel](https://github.com/stgeipel)|[KurtMar](https://github.com/KurtMar)|

Join Upcount [Slack workspace](https://join.slack.com/t/upcount/shared_invite/enQtOTY0Nzk5NTgzMjQ5LThlMWE3Y2YyNGY1MTc3M2Y1YmQ4YTdmZDYyNmJlYzBiNmQ0NTFhYjBkNzNjZjIwNWNlZDY2OTdiN2UwYzc3YWU) to join in on the discussion.

## License

[GPLv3 License](https://github.com/madisvain/upcount/blob/main/LICENSE) &copy; [Upcount](https://upcount.app)
