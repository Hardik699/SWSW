# Google Apps Script Auto-Sync Setup Guide

This guide shows you how to set up automatic syncing between your PC/Laptop management system and Google Sheets using Google Apps Script - **no server configuration needed!**

## ✨ Why Google Apps Script?

- ✅ **No environment variables** or server setup required
- ✅ **Simpler deployment** - works with any hosting platform
- ✅ **Direct Google integration** - runs on Google's servers
- ✅ **Real-time updates** - instant sync to your Google Sheet
- ✅ **Multiple organized sheets** automatically created

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it "PC Laptop Assets Management"

### Step 2: Add the Apps Script

1. In your Google Sheet: **Extensions → Apps Script**
2. Delete the default code
3. Copy the code from `google-apps-script/Code.gs` in your project
4. Paste it into the Apps Script editor
5. Save the project (Ctrl+S)

### Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon → Select **Web app**
3. Set **Execute as:** Me (your email)
4. Set **Who has access:** Anyone
5. Click **Deploy**
6. **Copy the Web app URL** that appears

### Step 4: Configure Your App

1. In your PC/Laptop management app, click **"Google Sheets"** in navigation
2. Paste the Web app URL in the configuration field
3. Click **Save**
4. Click **Test Connection** to verify
5. Click **Sync Now** to sync your existing data

## 🎯 What You Get

Once configured, your Google Sheet will automatically contain:

### 📊 **Organized Sheets:**

- **PC-Laptop Info** - Complete configurations with total RAM
- **All System Assets** - Master inventory list
- **Mouse, Keyboard, Motherboard** - Individual component sheets
- **RAM, Storage, Camera, Headphone** - More component categories
- **Power Supply, Monitor, Vonage** - Additional hardware
- **Summary** - Data counts and overview

### ⚡ **Auto-Sync Features:**

- **Real-time syncing** when you save PC/Laptop data
- **2-second delay** to prevent too many API calls
- **Manual sync buttons** on all relevant pages
- **"Setup Sync" buttons** appear when not configured

## 💻 **Apps Script Code Location**

The complete Google Apps Script code is in your project at:

```
google-apps-script/Code.gs
```

Key functions included:

- `doPost()` - Handles incoming data from your app
- `updatePCLaptopSheet()` - Creates PC/Laptop configurations sheet
- `updateSystemAssetsSheet()` - Creates master assets sheet
- `updateCategorySheets()` - Creates individual component sheets
- `updateSummarySheet()` - Creates summary with data counts

## 🔧 **Usage After Setup**

### Automatic Sync:

- Data syncs automatically when you save PC/Laptop configurations
- Updates appear in Google Sheets within 2 seconds
- No manual action required

### Manual Sync:

- **"Sync to Sheets"** buttons on PC/Laptop Info and System Info pages
- **"Sync Now"** button on configuration page
- **Test Connection** to verify setup

### Access Your Data:

- Your Google Sheet updates in real-time
- Share with team members for collaboration
- Use Google Sheets features (charts, filters, etc.)
- Export to Excel, PDF, or other formats as needed

## 🛠️ **Troubleshooting**

### Common Issues:

**"Web App URL not configured"**

- Make sure you pasted the correct Web app URL
- Ensure it ends with `/exec`
- Verify you deployed the script as a Web app

**"Connection test failed"**

- Check that the Apps Script project was saved
- Verify deployment settings (Execute as: Me, Access: Anyone)
- Try redeploying the Web app

**"Sync failed" error**

- Check the Apps Script execution log for errors
- Ensure your Google Sheet is accessible
- Verify the script code was pasted correctly

### Getting Help:

1. Visit the configuration page for detailed status
2. Use "Test Connection" to diagnose issues
3. Check Apps Script logs in the Google Apps Script editor
4. Review the deployment settings

## 🔐 **Security Notes**

- ✅ Script runs under your Google account
- ✅ Only you can access and modify the script
- ✅ Data transmission uses HTTPS
- ✅ No sensitive credentials stored in your app
- ✅ Google handles all authentication and authorization

## 📈 **Benefits Over Server-Side Setup**

1. **Simpler deployment** - No environment variables needed
2. **Works everywhere** - Compatible with any hosting platform
3. **No server maintenance** - Google handles the infrastructure
4. **Direct integration** - Native Google Sheets API access
5. **Real-time collaboration** - Standard Google Sheets sharing

## 🎉 **You're Done!**

Once set up, your PC/Laptop management system will automatically sync all data to your organized Google Sheet. Your team can access real-time data, create reports, and collaborate using familiar Google Sheets tools!

For detailed step-by-step instructions with screenshots, visit the configuration page in your app at `/google-apps-script-config`.
