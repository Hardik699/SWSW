import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Eye,
  EyeOff,
  FileText,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { googleSheetsSync } from "@/lib/googleSheetsSync";

export default function GoogleSheetsConfig() {
  const navigate = useNavigate();
  const [isConfigured, setIsConfigured] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [config, setConfig] = useState({
    spreadsheetId: "",
    serviceAccountCredentials: "",
  });

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    const configured = await googleSheetsSync.checkConfiguration();
    setIsConfigured(configured);
    if (configured) {
      setSpreadsheetUrl(googleSheetsSync.getSpreadsheetUrl());
    }
  };

  const testConnection = async () => {
    try {
      const result = await googleSheetsSync.syncAllData();
      if (result.success) {
        alert("✅ Connection successful! Data synced to Google Sheets.");
        await checkConfiguration();
      } else {
        alert(`❌ Connection failed: ${result.message}`);
      }
    } catch (error) {
      alert("❌ Connection test failed. Please check your configuration.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Google Sheets Configuration
            </h1>
            <p className="text-slate-400">
              Set up automatic syncing to Google Sheets
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
              <span className="text-slate-300">Google Sheets Integration:</span>
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

            {isConfigured && spreadsheetUrl && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Spreadsheet URL:</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => window.open(spreadsheetUrl, "_blank")}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Sheet
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(spreadsheetUrl)}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {isConfigured && (
              <div className="flex gap-2">
                <Button
                  onClick={testConnection}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-400">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                To set up Google Sheets auto-sync, you need to configure
                environment variables on your server. This requires
                administrative access to your deployment environment.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">
                  Step 1: Create Google Service Account
                </h3>
                <ol className="space-y-2 text-slate-300 text-sm list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select existing project</li>
                  <li>Enable Google Sheets API</li>
                  <li>Go to "IAM & Admin" → "Service Accounts"</li>
                  <li>Create a new service account</li>
                  <li>Download the JSON credentials file</li>
                </ol>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">
                  Step 2: Create Google Sheet
                </h3>
                <ol className="space-y-2 text-slate-300 text-sm list-decimal list-inside">
                  <li>Create a new Google Sheet</li>
                  <li>Share the sheet with your service account email</li>
                  <li>Give "Editor" permissions</li>
                  <li>Copy the Sheet ID from the URL</li>
                </ol>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">
                  Step 3: Set Environment Variables
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">GOOGLE_SHEET_ID</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value="your_google_sheet_id_here"
                        readOnly
                        className="bg-slate-700 border-slate-600 text-slate-300 font-mono text-sm"
                      />
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            "GOOGLE_SHEET_ID=your_google_sheet_id_here",
                          )
                        }
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">
                      GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value="your_service_account_json_credentials_here"
                        readOnly
                        className="bg-slate-700 border-slate-600 text-slate-300 font-mono text-sm"
                      />
                      <Button
                        onClick={() =>
                          copyToClipboard(
                            "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=your_service_account_json_credentials_here",
                          )
                        }
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-3">
                  Step 4: Configure Deployment
                </h3>
                <div className="space-y-2 text-slate-300 text-sm">
                  <p>
                    Add the environment variables to your deployment platform:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      <strong>Netlify:</strong> Site settings → Environment
                      variables
                    </li>
                    <li>
                      <strong>Vercel:</strong> Project settings → Environment
                      Variables
                    </li>
                    <li>
                      <strong>Railway:</strong> Project → Variables
                    </li>
                    <li>
                      <strong>Heroku:</strong> App settings → Config Vars
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Configuration */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Once you've configured the environment variables and redeployed
              your application, use the button below to test the connection:
            </p>

            <div className="flex gap-2">
              <Button
                onClick={checkConfiguration}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Check Configuration
              </Button>

              {isConfigured && (
                <Button
                  onClick={testConnection}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Sync
                </Button>
              )}
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
                <h4 className="text-white font-medium">Automatic Syncing</h4>
                <p className="text-slate-300 text-sm">
                  Data automatically syncs to Google Sheets when you save
                  PC/Laptop configurations
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium">Multiple Sheets</h4>
                <p className="text-slate-300 text-sm">
                  Organized data in separate sheets for each component category
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium">Real-time Updates</h4>
                <p className="text-slate-300 text-sm">
                  Changes reflect in Google Sheets within seconds of saving
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-medium">Manual Sync</h4>
                <p className="text-slate-300 text-sm">
                  Force sync all data at any time with the "Sync to Sheets"
                  button
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
