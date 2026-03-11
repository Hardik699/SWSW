// Google Apps Script sync service
export class GoogleAppsScriptSync {
  private static instance: GoogleAppsScriptSync;
  private webAppUrl: string = "";
  private isConfigured: boolean = false;

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): GoogleAppsScriptSync {
    if (!GoogleAppsScriptSync.instance) {
      GoogleAppsScriptSync.instance = new GoogleAppsScriptSync();
    }
    return GoogleAppsScriptSync.instance;
  }

  // Load web app URL from localStorage or environment
  private loadConfiguration(): void {
    const savedUrl = localStorage.getItem("googleAppsScriptWebAppUrl");
    if (savedUrl) {
      this.webAppUrl = savedUrl;
      this.isConfigured = true;
    }
  }

  // Configure the Google Apps Script Web App URL
  setWebAppUrl(url: string): void {
    if (!url) {
      this.isConfigured = false;
      this.webAppUrl = "";
      localStorage.removeItem("googleAppsScriptWebAppUrl");
      return;
    }

    // Validate URL format
    if (!url.includes("script.google.com") || !url.includes("/exec")) {
      throw new Error("Invalid Google Apps Script Web App URL");
    }

    this.webAppUrl = url;
    this.isConfigured = true;
    localStorage.setItem("googleAppsScriptWebAppUrl", url);
  }

  // Get current configuration status
  isReady(): boolean {
    return this.isConfigured && !!this.webAppUrl;
  }

  // Get the web app URL
  getWebAppUrl(): string {
    return this.webAppUrl;
  }

  // Sync all data to Google Apps Script
  async syncAllData(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      if (!this.isReady()) {
        return {
          success: false,
          message:
            "Google Apps Script Web App URL not configured. Please set it up first.",
        };
      }

      // Get data from MongoDB via API
      const [systemAssetsRes] = await Promise.all([
        fetch("/api/system-assets"),
      ]);

      const systemAssetsData = systemAssetsRes.ok
        ? (await systemAssetsRes.json()).data || []
        : [];

      // PC/Laptop data can be fetched from a future API endpoint
      const pcLaptopData: any[] = [];

      // Prepare payload
      const payload = {
        pcLaptopData,
        systemAssetsData,
        action: "sync",
        timestamp: new Date().toISOString(),
      };

      // Send to Google Apps Script
      const response = await fetch(this.webAppUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          message: `✅ Data synced successfully! Processed ${result.recordsProcessed?.pcLaptops || 0} PC/Laptops and ${result.recordsProcessed?.systemAssets || 0} system assets.`,
          details: result,
        };
      } else {
        return {
          success: false,
          message: `❌ Sync failed: ${result.error || "Unknown error"}`,
          details: result,
        };
      }
    } catch (error) {
      console.error("Google Apps Script sync error:", error);
      return {
        success: false,
        message: `❌ Sync failed: ${error instanceof Error ? error.message : "Network error"}`,
      };
    }
  }

  // Test connection to Google Apps Script
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isReady()) {
        return {
          success: false,
          message: "Web App URL not configured",
        };
      }

      // Send test payload
      const testPayload = {
        pcLaptopData: [],
        systemAssetsData: [],
        action: "test",
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.webAppUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        message: result.success
          ? "✅ Connection successful! Google Apps Script is working."
          : `❌ Connection failed: ${result.error}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Connection test failed: ${error instanceof Error ? error.message : "Network error"}`,
      };
    }
  }

  // Auto-sync with debouncing
  private syncTimeout: number | null = null;

  autoSync(): void {
    if (!this.isReady()) return;

    // Debounce auto-sync to avoid too many requests
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = window.setTimeout(async () => {
      try {
        const result = await this.syncAllData();
        if (result.success) {
          console.log("Auto-sync to Google Sheets completed:", result.message);
        } else {
          console.warn("Auto-sync failed:", result.message);
        }
      } catch (error) {
        console.error("Auto-sync error:", error);
      }
    }, 2000); // Wait 2 seconds after last change
  }

  // Manual sync with user feedback
  async manualSync(): Promise<void> {
    const result = await this.syncAllData();
    alert(result.message);
  }

  // Get Google Sheet URL (derived from web app URL)
  getGoogleSheetUrl(): string {
    if (!this.webAppUrl) return "";

    try {
      // Extract script ID from web app URL
      const match = this.webAppUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const scriptId = match[1];
        return `https://script.google.com/d/${scriptId}/edit`;
      }
    } catch (error) {
      console.error("Could not derive sheet URL:", error);
    }

    return "";
  }

  // Clear configuration
  clearConfiguration(): void {
    this.isConfigured = false;
    this.webAppUrl = "";
    localStorage.removeItem("googleAppsScriptWebAppUrl");
    // Synced data is now stored in MongoDB, no need to clear
  }
}

// Export singleton instance
export const googleAppsScriptSync = GoogleAppsScriptSync.getInstance();

// React hook for auto-sync
export const useGoogleAppsScriptAutoSync = () => {
  const triggerAutoSync = () => {
    googleAppsScriptSync.autoSync();
  };

  return {
    triggerAutoSync,
    isConfigured: googleAppsScriptSync.isReady(),
    setWebAppUrl: (url: string) => googleAppsScriptSync.setWebAppUrl(url),
    testConnection: () => googleAppsScriptSync.testConnection(),
    manualSync: () => googleAppsScriptSync.manualSync(),
    clearAllData: () => googleAppsScriptSync.clearConfiguration(),
  };
};
