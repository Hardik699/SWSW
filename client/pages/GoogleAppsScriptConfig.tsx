import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  FileText,
  RefreshCw,
  Code,
  Play,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import {
  googleAppsScriptSync,
  useGoogleAppsScriptAutoSync,
} from "@/lib/googleAppsScriptSync";

export default function GoogleAppsScriptConfig() {
  const navigate = useNavigate();
  const [isConfigured, setIsConfigured] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { testConnection, manualSync, clearAllData } = useGoogleAppsScriptAutoSync();

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const configured = googleAppsScriptSync.isReady();
    setIsConfigured(configured);
    if (configured) {
      const url = googleAppsScriptSync.getWebAppUrl();
      setWebAppUrl(url);
      setInputUrl(url);
    }
  };

  const saveConfiguration = async () => {
    try {
      if (!inputUrl.trim()) {
        alert("Please enter a valid Web App URL");
        return;
      }

      googleAppsScriptSync.setWebAppUrl(inputUrl.trim());
      checkConfiguration();
      alert("✅ Configuration saved successfully!");
    } catch (error) {
      alert(
        `❌ Configuration error: ${error instanceof Error ? error.message : "Invalid URL"}`,
      );
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testConnection();
      alert(result.message);
    } catch (error) {
      alert("❌ Connection test failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await manualSync();
    } catch (error) {
      alert("❌ Manual sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to remove the Google Apps Script configuration?\n\nThis will clear:\n- Web App URL configuration\n\nYour MongoDB data will remain untouched."
    );

    if (confirmed) {
      clearAllData();
      checkConfiguration();
      setInputUrl("");
      alert("✅ Configuration has been cleared successfully!");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const googleAppsScriptCode = `// Google Apps Script for PC/Laptop Asset Management Auto-Sync
// This script receives data from your web app and updates the Google Sheet

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    const { pcLaptopData, systemAssetsData, action } = data;
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Clear and update all sheets
    updatePCLaptopSheet(sheet, pcLaptopData, systemAssetsData);
    updateSystemAssetsSheet(sheet, systemAssetsData);
    updateCategorySheets(sheet, systemAssetsData);
    updateSummarySheet(sheet, pcLaptopData, systemAssetsData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data synced successfully to Google Sheets',
        timestamp: new Date().toISOString(),
        recordsProcessed: {
          pcLaptops: pcLaptopData.length,
          systemAssets: systemAssetsData.length
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Add more functions here (see full code in project files)`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Code className="h-8 w-8" />
              Google Apps Script Auto-Sync
            </h1>
            <p className="text-slate-400">
              Set up automatic syncing using Google Apps Script
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isConfigured && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <CheckCircle className="h-4 w-4 mr-1" />
                Configured
              </Badge>
            )}
            <Button
              onClick={() => navigate(-1)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
              title="Go back to previous page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </header>

        {/* Status Card */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Current Status
              {isConfigured ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Google Apps Script:</span>
              <Badge
                className={
                  isConfigured
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-red-500/20 text-red-400 border-red-500/50"
                }
              >
                {isConfigured ? "Connected" : "Not Connected"}
              </Badge>
            </div>

            {isConfigured && webAppUrl && (
              <div className="space-y-2">
                <span className="text-slate-300">Web App URL:</span>
                <div className="flex items-center gap-2">
                  <Input
                    value={webAppUrl}
                    readOnly
                    className="bg-slate-800 border-slate-600 text-slate-300 font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(webAppUrl)}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {isConfigured && (
                <>
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${isTestingConnection ? "animate-spin" : ""}`}
                    />
                    {isTestingConnection ? "Testing..." : "Test Connection"}
                  </Button>

                  <Button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                </>
              )}

              <Button
                onClick={handleClearAllData}
                className="bg-red-500 hover:bg-red-600 text-white ml-auto"
              >
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              Web App URL Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">
                Google Apps Script Web App URL
              </Label>
              <div className="flex gap-2">
                <Input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                  className="bg-slate-800 border-slate-600 text-white font-mono"
                />
                <Button
                  onClick={saveConfiguration}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save
                </Button>
              </div>
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-400">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Enter the Web App URL from your deployed Google Apps Script.
                This enables real-time auto-sync to your Google Sheet.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This method is simpler than server-side integration - no
                environment variables needed!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    1
                  </span>
                  Create Google Sheet
                </h3>
                <ol className="space-y-2 text-slate-300 text-sm list-decimal list-inside ml-4">
                  <li>
                    Go to{" "}
                    <a
                      href="https://sheets.google.com/"
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      Google Sheets
                    </a>
                  </li>
                  <li>Create a new blank spreadsheet</li>
                  <li>Name it "PC Laptop Assets Management" or similar</li>
                  <li>
                    Note: The script will automatically create all necessary
                    sheets
                  </li>
                </ol>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    2
                  </span>
                  Open Apps Script
                </h3>
                <ol className="space-y-2 text-slate-300 text-sm list-decimal list-inside ml-4">
                  <li>
                    In your Google Sheet, go to{" "}
                    <strong>Extensions → Apps Script</strong>
                  </li>
                  <li>Delete the default code in the editor</li>
                  <li>
                    Copy the Google Apps Script code from the next section
                  </li>
                  <li>Paste it into the Apps Script editor</li>
                  <li>Save the project (Ctrl+S)</li>
                </ol>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    3
                  </span>
                  Deploy as Web App
                </h3>
                <ol className="space-y-2 text-slate-300 text-sm list-decimal list-inside ml-4">
                  <li>
                    Click <strong>Deploy → New deployment</strong>
                  </li>
                  <li>
                    Click the gear icon → Select <strong>Web app</strong>
                  </li>
                  <li>
                    Set <strong>Execute as:</strong> Me (your email)
                  </li>
                  <li>
                    Set <strong>Who has access:</strong> Anyone
                  </li>
                  <li>
                    Click <strong>Deploy</strong>
                  </li>
                  <li>
                    Copy the <strong>Web app URL</strong> that appears
                  </li>
                  <li>Paste it in the configuration above</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Apps Script Code */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Google Apps Script Code
              <Button
                onClick={() => copyToClipboard(googleAppsScriptCode)}
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400">
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Copy this entire code and paste it into your Google Apps
                  Script editor. The complete code is available in the project
                  files at <code>google-apps-script/Code.gs</code>
                </AlertDescription>
              </Alert>

              <div className="bg-slate-800 p-4 rounded-lg overflow-x-auto">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                  <code>{googleAppsScriptCode}</code>
                </pre>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    window.open("https://script.google.com/", "_blank")
                  }
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Apps Script
                </Button>

                <Button
                  onClick={() => copyToClipboard(googleAppsScriptCode)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Full Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Auto-Sync Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-400" />
                  Automatic Syncing
                </h4>
                <p className="text-slate-300 text-sm">
                  Data automatically syncs when you save PC/Laptop
                  configurations
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Multiple Sheets
                </h4>
                <p className="text-slate-300 text-sm">
                  Organized data in separate sheets for each component category
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-emerald-400" />
                  Real-time Updates
                </h4>
                <p className="text-slate-300 text-sm">
                  Changes reflect in Google Sheets within seconds
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-400" />
                  No Server Setup
                </h4>
                <p className="text-slate-300 text-sm">
                  No environment variables or server configuration needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
