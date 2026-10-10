# Formbox

A free, serverless form backend that runs on Google Apps Script. One API endpoint collects form submissions from all your sites and apps, stores them in Google Sheets, and notifies you by email and/or Telegram.

One endpoint. Any product. Any form type. No server to run.

## Features

- **Google Sheets storage** — one spreadsheet per product, one tab per form type, columns added automatically
- **Notifications** — HTML email and/or Telegram message on every submission, each toggled independently
- **Webhooks** — optional `callback_url` receives the full submission as JSON
- **Spam protection** — honeypot fields, per-product and global rate limits
- **Lockdown options** — restrict accepted products and webhook hosts via Script Properties
- **Free** — runs entirely on your own Google account, no hosting or third-party service

## How It Works

1. Your frontend sends a POST request with the form data
2. Formbox auto-creates a Google Spreadsheet for the product (if new)
3. Formbox auto-creates a tab for the form type (if new)
4. Formbox auto-expands columns for any new payload fields
5. Formbox notifies you by email and/or Telegram, and calls your webhook if one was given

## API

### Endpoint

```
POST YOUR_WEB_APP_URL
Content-Type: text/plain
```

### Request Body

```json
{
  "product_name": "my-app",
  "form_type": "contact",
  "submitter_email": "user@example.com",
  "source_url": "https://my-app.com/contact",
  "priority": "normal",
  "payload": {
    "name": "Jane Doe",
    "message": "Hello!"
  }
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `product_name` | Yes | Identifies the product. A separate spreadsheet is created per product. Max 100 chars. |
| `form_type` | Yes | Identifies the form (e.g., `contact`, `wishlist`, `support`). Becomes the sheet tab name. Max 100 chars. |
| `submitter_email` | Yes | Email of the person submitting. Basic format validation applied. |
| `source_url` | No | Page URL where the form was submitted from. |
| `priority` | No | One of `low`, `normal`, `high`, `urgent`. Defaults to `normal`. |
| `payload` | No | Free-form JSON object. Each key becomes a column in the sheet. |
| `callback_url` | No | HTTPS URL to receive a webhook POST after successful submission. |

### Response

```json
{ "status": "ok", "submission_id": "fb_1723648200_a3x9" }
```

```json
{ "status": "error", "message": "Missing required field: form_type" }
```

```json
{ "status": "error", "message": "Rate limit exceeded. Try again later." }
```

## Form Types

Use any string as `form_type`. Tabs are auto-created. Common examples:

| Form Type | Typical Payload Fields |
|-----------|----------------------|
| `contact` | name, message, phone |
| `get_listed` | name, shop_name, phone |
| `wishlist` | item_id, item_name, item_url |
| `conversation` | name, message, preferred_channel |
| `support` | subject, description, category |
| `bug_report` | title, description, steps_to_reproduce, severity |
| `feature_request` | title, description, use_case |
| `newsletter` | name, interests |
| `demo_request` | name, company, company_size, use_case |
| `waitlist` | name, referral_source |
| `survey` | score, feedback, feature_rated |
| `review` | rating, review_text, display_name |
| `quote` | service_type, budget_range, timeline |
| `booking` | preferred_date, preferred_time, service |
| `callback` | phone, preferred_time, topic |
| `application` | name, role, linkedin_url, cover_note |

This list is not exhaustive. Any `form_type` string works — the system creates tabs on the fly.

## Frontend Integration

### JavaScript (works with any framework)

```js
const FORMBOX_URL = 'YOUR_WEB_APP_URL';

async function submitToFormbox(productName, formType, email, payload) {
  const res = await fetch(FORMBOX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      product_name: productName,
      form_type: formType,
      submitter_email: email,
      payload
    })
  });
  return res.json();
}
```

### Usage Examples

```js
// Contact form
submitToFormbox('my-app', 'contact', 'jane@example.com', {
  name: 'Jane Doe',
  message: 'I need help with pricing'
});

// Wishlist
submitToFormbox('my-app', 'wishlist', 'jane@example.com', {
  item_id: 'SKU-4821',
  item_name: 'Brake Pad Set'
});

// Support ticket (urgent)
submitToFormbox('my-app', 'support', 'user@company.com', {
  subject: 'Cannot login',
  description: 'Getting 500 error on login page'
});
```

### Honeypot (Spam Prevention)

Add a hidden field to your forms. Bots fill it, humans don't. If any payload key starting with `_` has a value, the submission is silently discarded.

```html
<input type="text" name="_hp" style="display:none" tabindex="-1" autocomplete="off">
```

```js
submitToFormbox('my-app', 'contact', email, {
  _hp: document.querySelector('[name="_hp"]').value,
  name: 'Jane',
  message: 'Hello'
});
```

## Google Sheets Layout

```
Google Drive
└── Formbox — my-app              (spreadsheet, auto-created)
    ├── contact                    (tab, auto-created)
    │   → submission_id | timestamp | product_name | form_type | submitter_email | source_url | priority | name | message | phone
    ├── wishlist                   (tab, auto-created)
    │   → submission_id | timestamp | product_name | form_type | submitter_email | source_url | priority | item_id | item_name | item_url
    └── support                    (tab, auto-created)
        → submission_id | timestamp | product_name | form_type | submitter_email | source_url | priority | subject | description
```

- One spreadsheet per product
- One tab per form type
- Columns auto-expand when new payload keys appear
- Envelope fields always come first in a fixed order

## Email Notifications

When `EMAIL_ENABLED` is `true`, every submission sends an email to `NOTIFICATION_EMAIL` with:

- Subject: `[Formbox] {product_name} / {form_type} — from {submitter_email}`
- Body: all envelope fields + all payload fields in a clean HTML table
- Priority is color-coded: green (normal), amber (high), red (urgent)

## Telegram Notifications

When `TELEGRAM_ENABLED` is `true`, every submission is also posted to `TELEGRAM_CHAT_ID` via your bot, with the product and form type as the header, priority emoji, and all payload fields.

## Webhook Callback

Send a `callback_url` in the request to receive a POST with the full submission data after processing. The URL must be HTTPS.

To stop others from using your deployment to send requests to arbitrary URLs, set the `ALLOWED_CALLBACK_HOSTS` Script Property to a comma-separated list of hostnames (e.g. `api.my-app.com, hooks.my-other-app.com`). Requests with any other callback host are rejected with `callback_url host is not allowed`.

```js
submitToFormbox('my-app', 'contact', 'jane@example.com', {
  name: 'Jane Doe',
  message: 'Hello'
});

// With webhook — your backend receives the submission data
await fetch(FORMBOX_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify({
    product_name: 'my-app',
    form_type: 'contact',
    submitter_email: 'jane@example.com',
    callback_url: 'https://your-api.com/webhook/formbox',
    payload: { name: 'Jane Doe', message: 'Hello' }
  })
});
```

Your callback endpoint receives:

```json
{
  "event": "form_submission",
  "submission_id": "fb_1723648200_a3x9",
  "timestamp": "2024-08-14T15:30:00.000Z",
  "product_name": "my-app",
  "form_type": "contact",
  "submitter_email": "jane@example.com",
  "source_url": "",
  "priority": "normal",
  "payload": { "name": "Jane Doe", "message": "Hello" }
}
```

## Rate Limiting

Apps Script doesn't expose the client IP, so limits are applied per product and globally:

- 5 submissions per minute / 50 per hour per `product_name`
- 20 submissions per minute / 200 per hour across all products (protects your Mail, Drive and UrlFetch quotas)
- Exceeding any limit returns a 429 error

Adjust these in `Config.gs` under `RATE_LIMIT`.

## Restricting Products

By default any `product_name` is accepted, and each new one creates a spreadsheet. To accept only your own products, set the `ALLOWED_PRODUCTS` Script Property to a comma-separated list:

```
my-app, my-other-app
```

Submissions for any other product are rejected with `Unknown product_name`. This is strongly recommended for public deployments.

## Configuration

### Script Properties

Notifications and secrets are configured in **Project Settings → Script Properties** in the Apps Script editor (never in code):

| Property | Description |
|----------|-------------|
| `EMAIL_ENABLED` | Set to `true` to send email notifications |
| `NOTIFICATION_EMAIL` | Address that receives email notifications |
| `TELEGRAM_ENABLED` | Set to `true` to send Telegram notifications |
| `TELEGRAM_BOT_TOKEN` | Bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Chat ID that receives Telegram notifications |
| `ALLOWED_PRODUCTS` | Optional comma-separated list of accepted `product_name` values |
| `ALLOWED_CALLBACK_HOSTS` | Optional comma-separated list of hostnames allowed in `callback_url` |

Email and Telegram are independent — enable either, both, or neither.

### Config.gs

Non-secret settings live in `Config.gs`:

```js
const CONFIG = {
  RATE_LIMIT: {
    PER_PRODUCT_PER_MINUTE: 5,
    PER_PRODUCT_PER_HOUR: 50,
    GLOBAL_PER_MINUTE: 20,
    GLOBAL_PER_HOUR: 200,
  },
  MAX_NAME_LENGTH: 100,
  PRIORITY_VALUES: ['low', 'normal', 'high', 'urgent'],
  DEFAULT_PRIORITY: 'normal',
  ENVELOPE_COLUMNS: [ /* fixed leading sheet columns */ ],
  HONEYPOT_PREFIX: '_',
  SPREADSHEET_NAME_PREFIX: 'Formbox',
};
```

## Deployment

1. Go to [script.google.com](https://script.google.com) and create a new project
2. Create a script file for each `.gs` file and copy the contents
3. Click **Deploy** → **New deployment** → **Web app**
4. Set **Who has access** to **Anyone**
5. Click **Deploy** and authorize when prompted
6. Copy the web app URL — that's your API endpoint

See `SETUP.md` for detailed instructions including the `clasp` CLI alternative.

## File Structure

```
formbox/
├── appsscript.json    — Project manifest
├── Config.gs          — Rate limits, settings
├── Main.gs            — doPost() / doGet() entry points
├── Validation.gs      — Required fields + email validation
├── RateLimit.gs       — Per-product and global rate limiting
├── Honeypot.gs        — Bot detection
├── Utils.gs           — ID generation
├── SheetWriter.gs     — Auto-create spreadsheets, tabs, columns
├── Notification.gs    — HTML email formatting and sending
├── TelegramNotification.gs — Telegram message formatting and sending
├── Webhook.gs         — Webhook callback to external URLs
├── SETUP.md           — Step-by-step deployment guide
├── CONTRIBUTING.md    — How to contribute
├── SECURITY.md        — How to report vulnerabilities
├── LICENSE            — MIT license
└── README.md          — This file
```

## Limits

| Resource | Free Google Account | Google Workspace |
|----------|-------------------|-----------------|
| Emails per day | 100 | 1,500 |
| Script runtime | 6 min / execution | 6 min / execution |
| Properties storage | 500 KB | 500 KB |

If you expect more than 100 submissions/day, use Google Workspace or switch to a digest notification model.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). For security issues, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
