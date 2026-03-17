# Google Drive Upload Plugin for Claude

Upload files directly from Claude (Cowork & Claude Code) to your Google Drive.

No OAuth flow, no complex API setup. A simple Google Apps Script handles everything.

## Installation

```
/plugin marketplace add msmobileapps/google-drive-upload-plugin
/plugin install google-drive-upload@msapps-plugins
```

## Features

- Upload any file type (docx, pdf, xlsx, pptx, images, code, etc.)
- Target specific folders by path ‚Äî creates missing folders automatically
- Hebrew filenames supported
- Replace existing files or keep duplicates
- List Drive folders from within Claude
- Up to 50MB per file

## Setup

One-time setup takes about 5 minutes. See the full guide in `skills/google-drive-upload/references/setup-guide.md`.

1. Deploy the included Google Apps Script to your Google account
2. Create a config file with your script URL and API key
3. Start using it ‚Äî just say "Upload to Drive"

## Usage

Once set up, just ask Claude naturally:

- "Upload this report to Google Drive"
- "Save the presentation in Clients/Acme on Drive"
- "◊™◊¢◊ú◊î ◊ê◊™ ◊ñ◊î ◊ú◊ì◊®◊ô◊ô◊ë"

## Built by

[MSApps](https://msapps.mobi) ‚Äî AI Automation & Application Development

Need custom AI automations for your business? Visit [msapps.mobi](https://msapps.mobi) or email michal@msapps.mobi
