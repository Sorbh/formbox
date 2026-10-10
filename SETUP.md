# Formbox — Setup Guide

## Deploy to Google Apps Script

### Step 1: Create the Apps Script project

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name it **Formbox**

### Step 2: Copy the code files

Create these files in the Apps Script editor (click `+` → Script):

| Local file        | Apps Script file name |
|-------------------|-----------------------|
| Config.gs         | Config                |
| Main.gs           | Main                  |
| Validation.gs     | Validation            |
| RateLimit.gs      | RateLimit             |
| Honeypot.gs       | Honeypot              |
| Utils.gs          | Utils                 |
| SheetWriter.gs    | SheetWriter           |
| Notification.gs   | Notification          |
| TelegramNotification.gs | TelegramNotification |
| Webhook.gs        | Webhook               |

Copy each file's contents into the corresponding Apps Script file.

Delete the default `Code.gs` file that comes with the project.

### Step 3: Set Script Properties

In the Apps Script editor, go to **Project Settings** (gear icon) → **Script Properties** and add the ones you need:

| Property | Value |
|----------|-------|
| `EMAIL_ENABLED` | `true` to enable email notifications |
| `NOTIFICATION_EMAIL` | Your email address |
| `TELEGRAM_ENABLED` | `true` to enable Telegram notifications |
| `TELEGRAM_BOT_TOKEN` | Your bot token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | The chat ID to send messages to |
| `ALLOWED_PRODUCTS` | Comma-separated product names to accept, e.g. `my-app, my-other-app` (recommended) |

Secrets stay in Script Properties, never in code.

### Step 4: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon → Select **Web app**
3. Set:
   - **Description**: Formbox v1
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** when prompted (grant Sheets, Mail and external request permissions)
6. Copy the **Web app URL** — this is your API endpoint

### Step 5: Test

```bash
curl -X POST 'YOUR_WEB_APP_URL' \
  -H 'Content-Type: application/json' \
  -d '{
    "product_name": "test-product",
    "form_type": "contact",
    "submitter_email": "test@example.com",
    "payload": {
      "name": "Test User",
      "message": "Hello from Formbox!"
    }
  }'
```

You should:
- Get back `{"status":"ok","submission_id":"fb_..."}`
- See a new spreadsheet called "Formbox — test-product" in your Google Drive
- Receive an email and/or Telegram message with the full submission data (if enabled)

## Alternative: Use clasp (CLI deploy)

If you have [clasp](https://github.com/google/clasp) installed:

```bash
cd formbox
clasp login
clasp create --title "Formbox" --type webapp
clasp push
clasp deploy --description "Formbox v1"
```

## File Structure

```
formbox/
├── appsscript.json    # Apps Script project manifest
├── Config.gs          # Configuration (rate limits, settings)
├── Main.gs            # doPost/doGet entry points
├── Validation.gs      # Envelope validation + email check
├── RateLimit.gs       # Per-product and global rate limiting via CacheService
├── Honeypot.gs        # Bot detection via hidden fields
├── Utils.gs           # ID generation
├── SheetWriter.gs     # Spreadsheet/tab/column auto-creation
├── Notification.gs    # Email formatting and sending
├── TelegramNotification.gs # Telegram formatting and sending
├── Webhook.gs         # Webhook callback to external URLs
├── LICENSE            # MIT license
└── SETUP.md           # This file
```
