---
name: google-drive-upload
description: >
  Upload files to Google Drive via Google Apps Script API.
  Trigger on: upload to Drive, save to Drive, send to Drive, put this in Drive,
  upload to Google Drive. Also Hebrew: "תעלה לדרייב", "שמור בדרייב", "העלה לגוגל דרייב", "תשמור בדרייב".
  Use proactively when a workflow produces a file the user might want in Drive.
version: 1.0.0
---

# Google Drive Upload

Upload files directly to Google Drive via a deployed Google Apps Script web app.

## Prerequisites

This plugin requires a one-time setup:
1. A Google Apps Script deployed as a web app (see `references/setup-guide.md`)
2. A config file at `~/.cowork-gdrive-config.json` with the script URL and API key

## Reading the config

At the start of every upload, read the config:

```bash
cat "$HOME/.cowork-gdrive-config.json" 2>/dev/null || echo "NOT_CONFIGURED"
```

Expected format:
```json
{
  "url": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  "apiKey": "your-api-key-here"
}
```

If NOT_CONFIGURED, direct the user to the setup guide in `references/setup-guide.md`.

## Upload workflow

### 1. Identify the file to upload

```bash
ls -lt /path/to/outputs/ | head -10
```

### 2. Base64-encode and upload

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

curl -s -L \
  -H "Content-Type: application/json" \
  -d @/tmp/upload_payload.json \
  "APPS_SCRIPT_URL"

rm /tmp/upload_payload.json
```

### 3. Handle the response

Success response:
```json
{
  "success": true,
  "fileId": "abc123",
  "fileName": "report.docx",
  "fileUrl": "https://drive.google.com/file/d/abc123/view",
  "folderName": "My Drive",
  "size": 45678
}
```

Share the `fileUrl` with the user on success. On failure, check the error message.

## Folder targeting

- `folderPath`: "Clients/Acme" — creates folders if they don't exist
- `folderId`: "1abc..." — target a specific folder by ID
- Neither: saves to root of My Drive

## List folders

```bash
curl -s -L "APPS_SCRIPT_URL?action=list_folders"
curl -s -L "APPS_SCRIPT_URL?action=list_folders&folderId=FOLDER_ID"
```

## Key notes

- File size limit: ~50MB (Google Apps Script limit)
- Hebrew filenames work perfectly
- MIME types are auto-detected but can be overridden
- Add `"replaceExisting": true` to replace files instead of duplicating
- Rate limit: ~20,000 calls/day
