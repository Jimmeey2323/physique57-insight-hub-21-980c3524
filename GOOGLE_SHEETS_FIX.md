# Google Sheets Connection Fix Guide

## Problem
You're seeing a "Connection Error" with "Failed to load sales data" because the Google OAuth refresh token has expired.

## Root Cause
The refresh token in `/src/hooks/useGoogleSheets.ts` has expired or been revoked. This happens when:
- Token hasn't been used for 6+ months
- User changed password
- Token was manually revoked
- Google security policies triggered revocation

## Solution Steps

### Step 1: Generate New OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create a new one)
3. **Enable Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs: `https://developers.google.com/oauthplayground`

### Step 2: Get New Refresh Token

1. **Go to OAuth 2.0 Playground**: https://developers.google.com/oauthplayground/
2. **Configure OAuth 2.0**:
   - Click the gear icon (⚙️) in top right
   - Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - Close the configuration

3. **Authorize APIs**:
   - In Step 1, find "Google Sheets API v4"
   - Select: `https://www.googleapis.com/auth/spreadsheets.readonly`
   - Click "Authorize APIs"
   - Sign in with your Google account
   - Click "Allow"

4. **Get Tokens**:
   - In Step 2, click "Exchange authorization code for tokens"
   - Copy the "Refresh token" value

### Step 3: Update Your Application

Create a `.env` file in your project root:

```bash
VITE_GOOGLE_CLIENT_ID=your_new_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_new_client_secret_here
VITE_GOOGLE_REFRESH_TOKEN=your_new_refresh_token_here
VITE_GOOGLE_SPREADSHEET_ID=149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI
```

### Step 4: Restart Development Server

```bash
npm run dev
```

## Verification

After completing the steps:
1. Navigate to the Sales Analytics page
2. You should see a loading state instead of the error
3. Data should load successfully

## Troubleshooting

If you still see errors:

1. **Check Console**: Open browser dev tools to see detailed error messages
2. **Verify Permissions**: Ensure the Google account has access to the spreadsheet
3. **Test API Call**: Use the curl command to test the OAuth token:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&refresh_token=YOUR_REFRESH_TOKEN&grant_type=refresh_token"
```

4. **Check Spreadsheet Access**: Verify the spreadsheet ID is correct and accessible

## Security Best Practices

- Never commit the `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use environment-specific credentials for production
- Regularly rotate OAuth tokens
- Consider using Google Service Account for production applications

## Alternative: Service Account (Recommended for Production)

For production applications, consider using a Google Service Account instead of OAuth:

1. Create a Service Account in Google Cloud Console
2. Download the JSON key file
3. Share the spreadsheet with the service account email
4. Use Google APIs Node.js client library with the service account

This approach is more secure and doesn't require token refresh.
