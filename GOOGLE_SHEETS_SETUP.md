# Google Sheets Integration Setup Guide

This guide will help you set up automatic syncing between your PC/Laptop management system and Google Sheets.

## Overview

Once configured, your application will automatically:

- ✅ Sync all PC/Laptop configurations to Google Sheets
- ✅ Create separate sheets for each component category (Mouse, Keyboard, RAM, Storage, etc.)
- ✅ Update data in real-time when you save changes
- ✅ Provide a summary sheet with data counts
- ✅ Allow manual sync and direct access to your Google Sheet

## Prerequisites

- Google Cloud Console account
- Admin access to your deployment environment
- Basic understanding of environment variables

## Step 1: Create Google Service Account

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing project

2. **Enable Google Sheets API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Enter name: `pc-laptop-sheets-sync`
   - Enter description: `Service account for PC/Laptop management system`
   - Click "Create and Continue"

4. **Download Credentials**
   - Click on your newly created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Download the JSON file
   - **Keep this file secure and never commit it to version control**

## Step 2: Create Google Sheet

1. **Create New Sheet**
   - Go to https://sheets.google.com/
   - Create a new Google Sheet
   - Name it something like "PC Laptop Assets Management"

2. **Share with Service Account**
   - Copy the `client_email` from your downloaded JSON credentials
   - Click "Share" button in your Google Sheet
   - Paste the service account email
   - Set permission to "Editor"
   - Uncheck "Notify people"
   - Click "Send"

3. **Get Sheet ID**
   - Copy the Sheet ID from the URL
   - Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Sheet ID is: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Step 3: Configure Environment Variables

Add these environment variables to your deployment platform:

### Required Variables:

```bash
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"your-project-id",...}
```

### Platform-Specific Instructions:

#### **Netlify**

1. Go to your site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add both variables
4. Redeploy your site

#### **Vercel**

1. Go to your project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add both variables
4. Redeploy your project

#### **Railway**

1. Go to your project dashboard
2. Navigate to "Variables" tab
3. Add both variables
4. Railway will auto-redeploy

#### **Heroku**

1. Go to your app dashboard
2. Navigate to "Settings" → "Config Vars"
3. Add both variables
4. Restart your dynos

#### **Docker/VPS**

Add to your `.env` file or docker-compose.yml:

```bash
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account","project_id":"your-project-id",...}'
```

## Step 4: Format Service Account Credentials

The `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` should be the entire JSON file content as a single line string:

### Example Format:

```json
{
  "type": "service_account",
  "project_id": "your-project-123",
  "private_key_id": "abc123",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANB...",
  "client_email": "pc-laptop-sheets-sync@your-project-123.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/pc-laptop-sheets-sync%40your-project-123.iam.gserviceaccount.com"
}
```

**Important:** Make sure the JSON is properly escaped if your platform requires it.

## Step 5: Test Configuration

1. **Redeploy your application** after adding environment variables
2. **Navigate to Google Sheets Config page** in your app
3. **Click "Check Configuration"** to verify setup
4. **Click "Test Sync"** to sync your current data
5. **Check your Google Sheet** to confirm data appears

## Features After Setup

### Automatic Syncing

- Data syncs automatically when you save PC/Laptop configurations
- Updates happen within 2 seconds of saving changes
- No manual intervention required

### Manual Sync Options

- "Sync to Sheets" button on PC/Laptop Info page
- "Export All Data" with direct Sheet sync on System Info page
- Manual sync button on Google Sheets Config page

### Sheet Organization

Your Google Sheet will contain these tabs:

- **PC-Laptop Info**: Complete PC configurations with component details
- **All System Assets**: Master list of all hardware assets
- **Category Sheets**: Mouse, Keyboard, Motherboard, RAM, Storage, etc.
- **Summary**: Data counts and overview

### Direct Access

- "View Sheets" button opens your Google Sheet directly
- Real-time collaboration with your team
- Standard Google Sheets features (charts, filters, sharing, etc.)

## Troubleshooting

### Common Issues:

1. **"Google Sheets is not configured" error**
   - Check that environment variables are set correctly
   - Verify the service account email has Editor access to your sheet
   - Ensure your deployment restarted after adding variables

2. **"Authentication failed" error**
   - Verify the JSON credentials format
   - Check that the project ID matches
   - Ensure the private key is properly formatted

3. **"Sheet not found" error**
   - Verify the Sheet ID is correct
   - Confirm the service account has access to the sheet
   - Check that the sheet wasn't deleted or moved

4. **"Permission denied" error**
   - Service account needs Editor permissions
   - Re-share the sheet with the service account email
   - Check that the service account is active

### Getting Help:

1. **Check Browser Console**: Look for detailed error messages
2. **Verify Configuration**: Use the "Check Configuration" button
3. **Test Step by Step**: Follow each setup step carefully
4. **Check Environment Variables**: Ensure they're properly set in your deployment

## Security Notes

- ✅ Service account credentials are stored securely as environment variables
- ✅ No sensitive data is logged in the application
- ✅ Only authorized service accounts can access your sheets
- ✅ Data transmission uses HTTPS encryption
- ❌ Never commit service account JSON files to version control
- ❌ Don't share service account credentials in plain text

## Support

If you encounter issues:

1. Review this guide step by step
2. Check the Google Sheets Config page for status information
3. Verify your Google Cloud Console setup
4. Ensure environment variables are properly configured in your deployment platform

Once configured, your PC/Laptop management system will seamlessly sync with Google Sheets, providing real-time data access and collaboration capabilities!
