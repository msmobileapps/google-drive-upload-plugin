# Setup Guide ‚Äî Google Drive Upload Plugin

## Step 1: Create the Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Name it "Claude Drive Upload"
4. Delete the default code and paste the contents of `apps-script-code.js` (included in this plugin)
5. Change the `API_KEY` value in the `CONFIG` object to a random string ‚Äî generate one at [uuidgenerator.net](https://www.uuidgenerator.net/)

## Step 2: Deploy as Web App

1. Click **Deploy** ‚Üí **New deployment**
2. Click the gear icon ‚Üí select **Web app**
3. Set:
   - **Description**: "Claude Drive Upload"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the app when prompted
6. Copy the **Web app URL**

## Step 3: Create the Config File

Run this in your terminal (replace the placeholders):

```bash
cat > ~/.cowork-gdrive-config.json << 'EOF'
{
  "url": "YOUR_WEB_APP_URL_HERE",
  "apiKey": "YOUR_API_KEY_HERE"
}
EOF
```

## Step 4: Test

Ask Claude: "Upload a test file to Google Drive"

If it works, you'll see a Drive link in the response.

## Troubleshooting

- **NOT_CONFIGURED**: The config file doesn't exist. Run Step 3 again.
- **Invalid API key**: The API key in the config doesn't match the one in the Apps Script.
- **File too large**: Google Apps Script has a ~50MB limit.
- **URL changed after redeployment**: Update the URL in `~/.cowork-gdrive-config.json`.
