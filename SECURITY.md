# Security Policy

## Reporting a Vulnerability

Please **do not** open a public issue for security problems.

Report vulnerabilities privately through GitHub's
[private vulnerability reporting](https://github.com/Sorbh/formbox/security/advisories/new).
Include steps to reproduce and the impact you expect.

You should get a response within a few days. Once a fix is ready, the advisory will be published with credit to the reporter unless you prefer to stay anonymous.

## Hardening Your Deployment

Your web app URL is public by design, so anyone who finds it can send requests. Recommended Script Properties:

- `ALLOWED_PRODUCTS` — accept only your own `product_name` values
- `ALLOWED_CALLBACK_HOSTS` — allow webhooks only to your own hosts

Never put secrets (Telegram bot token, email address) in code — keep them in Script Properties.
