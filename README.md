# Google Drive Upload Plugin for Claude

Upload files directly from Claude (Cowork & Claude Code) to your Google Drive.

No OAuth flow, no complex API setup. A simple Google Apps Script handles everything.

## Installation

### From Plugin Marketplace

```
/plugin marketplace add msmobileapps/google-drive-upload-plugin
/plugin install google-drive-upload@msapps-plugins
```

## Features

- Upload any file type (docx, pdf, xlsx, pptx, images, code, etc.)
- Target specific folders by path — creates missing folders automatically
- Hebrew filenames supported
- Replace existing files or keep duplicates
- List Drive folders from within Claude
- Up to 50MB per file

## Setup

One-time setup takes about 5 minutes. See the full guide in `skills/google-drive-upload/references/setup-guide.md`.

1. Deploy the included Google Apps Script to your Google account
2. Create a config file with your script URL and API key
3. Start using it — just say "Upload to Drive"

## Usage

Once set up, just ask Claude naturally:

- "Upload this report to Google Drive"
- "Save the presentation in Clients/Acme on Drive"
- "תעלה את זה לדרייב"

## Built by

[MSApps](https://msapps.mobi) — AI Automation & Application Development

Contact: michal@msapps.mobi
