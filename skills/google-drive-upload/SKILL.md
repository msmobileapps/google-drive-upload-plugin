---
name: google-drive-upload
description: >
  Upload files to Google Drive via Google Apps Script API.
  This skill should be used when the user asks to "upload to Drive", "save to Drive",
  "send to Drive", "put this in Drive", "upload to Google Drive", or any mention of
  saving or uploading files to Google Drive. Also trigger on Hebrew phrases like
  "תעלה לדרייב", "שמור בדרייב", "העלה לגוגל דרייב", "תשמור בדרייב".
  Use proactively when a workflow produces a file the user might want in Drive.
version: 1.1.0
---

# Google Drive Upload

Upload files directly to Google Drive via a deployed Google Apps Script web app.

## Free Tier and Pro License

This skill uses a **freemium model**:
- **Free**: 5 uploads per month (tracked locally at `~/.cowork-gdrive-usage.json`)
- **Pro**: Unlimited uploads — add your license key to `~/.cowork-gdrive-config.json`

Get a Pro license at: https://michalicious361.gumroad.com/l/gdrive-claude-pro ($9)

---

## Prerequisites

1. A Google Apps Script deployed as a web app (see `references/setup-guide.md`)
2. A config file at `~/.cowork-gdrive-config.json` with the script URL, API key, and optionally a Pro license key

---

## Step 1 — Read config

At the start of every upload, read the config:

```applescript
do shell script "cat '$HOME/.cowork-gdrive-config.json' 2>/dev/null || echo 'NOT_CONFIGURED'"
```

Expected format:
```json
{
  "url": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  "apiKey": "your-api-key-here",
  "LICENSE_KEY": ""
}
```

If NOT_CONFIGURED, direct the user to `references/setup-guide.md` and stop.

---

## Step 2 — Check free-tier usage

Run this and save the result as CURRENT_COUNT:

```applescript
do shell script "python3 -c \"import json,os;from datetime import datetime;f=os.path.expanduser('~/.cowork-gdrive-usage.json');d=json.load(open(f)) if os.path.exists(f) else {'month':datetime.now().strftime('%Y-%m'),'count':0};d={'month':datetime.now().strftime('%Y-%m'),'count':0} if d.get('month')!=datetime.now().strftime('%Y-%m') else d;print(d['count'])\""
```

---

## Step 3 — Enforce freemium limits

**If CURRENT_COUNT < 5**: free tier available, proceed to Step 4.

**If CURRENT_COUNT >= 5**: read the LICENSE_KEY from config.

- **If empty**: stop and tell the user: "You have used your 5 free uploads this month. Get a Pro license at https://michalicious361.gumroad.com/l/gdrive-claude-pro ($9) and add the key to ~/.cowork-gdrive-config.json as LICENSE_KEY."

- **If a key exists**: validate against Gumroad:

```applescript
do shell script "curl -s -X POST 'https://api.gumroad.com/v2/licenses/verify' -d 'product_id=qgblm' -d 'license_key=YOUR_KEY_HERE'"
```

  - Response has "success":true → Pro user confirmed, proceed to Step 4 with no limit.
  - Response has "success":false → invalid key, stop and inform user.

---

## Step 4 — Upload the file

```bash
FILE="/path/to/outputs/FILENAME"
B64=$(base64 "$FILE" | tr -d '\n')
MIME=$(file --mime-type -b "$FILE")

cat > /tmp/upload_payload.json << JSONEOF
{
  "fileName": "FILENAME",
  "content": "$B64",
  "mimeType": "$MIME",
  "apiKey": "API_KEY_HERE",
  "folderPath": "OPTIONAL/FOLDER/PATH"
}
JSONEOF

curl -s -L -H "Content-Type: application/json" -d @/tmp/upload_payload.json "APPS_SCRIPT_URL"
rm /tmp/upload_payload.json
```

On success share the fileUrl with the user. On failure check the error message.

---

## Step 5 — Increment usage counter (free tier only)

Skip for Pro users. For free tier (CURRENT_COUNT < 5), run after a successful upload:

```applescript
do shell script "python3 -c \"import json,os;from datetime import datetime;f=os.path.expanduser('~/.cowork-gdrive-usage.json');m=datetime.now().strftime('%Y-%m');d=json.load(open(f)) if os.path.exists(f) else {'month':m,'count':0};d={'month':m,'count':0} if d.get('month')!=m else d;d['count']+=1;json.dump(d,open(f,'w'));print(str(d['count'])+'/5 used, '+str(max(0,5-d['count']))+' remaining this month')\""
```

Tell the user: "Uploaded to Drive! You've used X/5 free uploads this month (Y remaining)."

---

## Folder targeting

- `folderPath`: "Clients/Acme" creates folders if they don't exist
- `folderId`: "1abc..." targets a specific folder by ID
- Neither: saves to root of My Drive

## List folders

```bash
curl -s -L "APPS_SCRIPT_URL?action=list_folders"
```

## Key notes

- File size limit: ~50MB
- Hebrew filenames work perfectly
- MIME types are auto-detected but can be overridden
- Add "replaceExisting": true to replace files instead of duplicating
- Rate limit: ~20,000 calls/day
- Usage counter resets automatically on the 1st of each month
