# Contributing to Formbox

Thanks for your interest in improving Formbox! Bug reports, feature ideas and pull requests are all welcome.

## Reporting Bugs and Requesting Features

- **Bugs:** open an issue using the **Bug report** template.
- **Features:** open an issue using the **Feature request** template.
- **Security problems:** do **not** open a public issue — see [SECURITY.md](SECURITY.md).

Please search existing issues first to avoid duplicates.

## Development Setup

Formbox is plain Google Apps Script (V8 runtime) with no build step or dependencies.

1. Fork and clone the repo.
2. Create your own Apps Script project to test against — either copy the files in manually (see [SETUP.md](SETUP.md)) or use [clasp](https://github.com/google/clasp):
   ```bash
   clasp login
   clasp create --title "Formbox (dev)" --type webapp
   clasp push
   ```
3. Deploy as a web app and test with `curl` or your own frontend.

Never commit `.clasp.json`, real web app URLs, email addresses, bot tokens or chat IDs. Configuration that varies per deployment belongs in Script Properties, not in code.

## Pull Requests

1. Create a branch from `main`.
2. Keep changes focused — one feature or fix per PR.
3. Match the existing code style: `var`, plain functions, one concern per `.gs` file, no external libraries.
4. Update `README.md` and `SETUP.md` if you add or change fields, Script Properties or behaviour.
5. Describe how you tested the change (e.g. the `curl` request and what showed up in Sheets / email / Telegram).

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Slack notifications
fix: handle empty payload in Telegram message
docs: clarify Script Properties setup
```

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
