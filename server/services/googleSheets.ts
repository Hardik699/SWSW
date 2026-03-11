import { google } from "googleapis";
import { RequestHandler } from "express";

// Google Sheets service class
export class GoogleSheetsService {
  private sheets: any;
  private auth: any;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || "";
  }

  // Initialize Google Sheets API with service account
  async initializeAuth() {
    try {
      // Use service account credentials from environment
      const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
      if (!credentials) {
        console.warn(
          "⚠️ Google Service Account credentials not configured. Google Sheets sync will be unavailable.",
        );
        return false;
      }

      const serviceAccount = JSON.parse(credentials);

      this.auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.sheets = google.sheets({ version: "v4", auth: this.auth });
      return true;
    } catch (error) {
      console.error("Failed to initialize Google Sheets auth:", error);
      return false;
    }
  }

  // Create spreadsheet if it doesn't exist
  async createSpreadsheet() {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      const response = await this.sheets.spreadsheets.create({
        resource: {
          properties: {
            title: `PC_Laptop_Assets_${new Date().toISOString().split("T")[0]}`,
          },
          sheets: [
            { properties: { title: "PC-Laptop Info" } },
            { properties: { title: "All System Assets" } },
            { properties: { title: "Mouse" } },
            { properties: { title: "Keyboard" } },
            { properties: { title: "Motherboard" } },
            { properties: { title: "RAM" } },
            { properties: { title: "Storage" } },
            { properties: { title: "Camera" } },
            { properties: { title: "Headphone" } },
            { properties: { title: "Power Supply" } },
            { properties: { title: "Monitor" } },
            { properties: { title: "Vonage" } },
            { properties: { title: "Summary" } },
          ],
        },
      });

      this.spreadsheetId = response.data.spreadsheetId!;
      return response.data.spreadsheetId;
    } catch (error) {
      console.error("Failed to create spreadsheet:", error);
      throw error;
    }
  }

  // Update or create sheet with data
  async updateSheet(sheetName: string, data: any[], headers: string[]) {
    try {
      if (!this.sheets) {
        await this.initializeAuth();
      }

      // Clear existing data
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      // Prepare data with headers
      const values = [
        headers,
        ...data.map((item) => headers.map((header) => item[header] || "-")),
      ];

      // Update sheet with new data
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        resource: {
          values,
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Failed to update sheet ${sheetName}:`, error);
      throw error;
    }
  }

  // Sync all data to Google Sheets
  async syncAllData(pcLaptopData: any[], systemAssetsData: any[]) {
    try {
      if (!this.spreadsheetId) {
        await this.createSpreadsheet();
      }

      // 1. PC/Laptop Info Sheet
      const pcLaptopSheet = pcLaptopData.map((item: any) => {
        // Get storage details
        const storageDetails = item.storageId
          ? systemAssetsData.find((s: any) => s.id === item.storageId)
          : null;

        // Get RAM details
        const ram1Details = item.ramId
          ? systemAssetsData.find((s: any) => s.id === item.ramId)
          : null;
        const ram2Details = item.ramId2
          ? systemAssetsData.find((s: any) => s.id === item.ramId2)
          : null;

        // Calculate total RAM
        let totalRam = 0;
        if (ram1Details?.ramSize) {
          totalRam += parseInt(ram1Details.ramSize.replace(/[^0-9]/g, "")) || 0;
        }
        if (ram2Details?.ramSize) {
          totalRam += parseInt(ram2Details.ramSize.replace(/[^0-9]/g, "")) || 0;
        }

        return {
          "PC/Laptop ID": item.id,
          "Mouse ID": item.mouseId || "-",
          "Keyboard ID": item.keyboardId || "-",
          "Motherboard ID": item.motherboardId || "-",
          "Camera ID": item.cameraId || "-",
          "Headphone ID": item.headphoneId || "-",
          "Power Supply ID": item.powerSupplyId || "-",
          "Storage ID": item.storageId || "-",
          "Storage Type": storageDetails?.storageType || "-",
          "Storage Capacity": storageDetails?.storageCapacity || "-",
          "RAM Slot 1 ID": item.ramId || "-",
          "RAM Slot 1 Size": ram1Details?.ramSize || "-",
          "RAM Slot 2 ID": item.ramId2 || "-",
          "RAM Slot 2 Size": ram2Details?.ramSize || "-",
          "Total RAM": totalRam > 0 ? `${totalRam}GB` : "-",
          "Created Date": new Date(item.createdAt).toLocaleDateString(),
        };
      });

      await this.updateSheet("PC-Laptop Info", pcLaptopSheet, [
        "PC/Laptop ID",
        "Mouse ID",
        "Keyboard ID",
        "Motherboard ID",
        "Camera ID",
        "Headphone ID",
        "Power Supply ID",
        "Storage ID",
        "Storage Type",
        "Storage Capacity",
        "RAM Slot 1 ID",
        "RAM Slot 1 Size",
        "RAM Slot 2 ID",
        "RAM Slot 2 Size",
        "Total RAM",
        "Created Date",
      ]);

      // 2. All System Assets Sheet
      const allAssetsSheet = systemAssetsData.map((asset: any) => ({
        "Asset ID": asset.id,
        Category: asset.category,
        "Serial Number": asset.serialNumber || "-",
        "Vendor Name": asset.vendorName || "-",
        "Company Name": asset.companyName || "-",
        "Purchase Date": asset.purchaseDate
          ? new Date(asset.purchaseDate).toLocaleDateString()
          : "-",
        "Warranty End Date": asset.warrantyEndDate
          ? new Date(asset.warrantyEndDate).toLocaleDateString()
          : "-",
        "RAM Size": asset.ramSize || "-",
        "RAM Type": asset.ramType || "-",
        "Processor Model": asset.processorModel || "-",
        "Storage Type": asset.storageType || "-",
        "Storage Capacity": asset.storageCapacity || "-",
        "Vonage Number": asset.vonageNumber || "-",
        "Extension Code": asset.vonageExtCode || "-",
        Password: asset.vonagePassword || "-",
        "Created Date": new Date(asset.createdAt).toLocaleDateString(),
      }));

      await this.updateSheet("All System Assets", allAssetsSheet, [
        "Asset ID",
        "Category",
        "Serial Number",
        "Vendor Name",
        "Company Name",
        "Purchase Date",
        "Warranty End Date",
        "RAM Size",
        "RAM Type",
        "Processor Model",
        "Storage Type",
        "Storage Capacity",
        "Vonage Number",
        "Extension Code",
        "Password",
        "Created Date",
      ]);

      // 3. Category-specific sheets
      const categories = [
        { name: "Mouse", category: "mouse" },
        { name: "Keyboard", category: "keyboard" },
        { name: "Motherboard", category: "motherboard" },
        { name: "RAM", category: "ram" },
        { name: "Storage", category: "storage" },
        { name: "Camera", category: "camera" },
        { name: "Headphone", category: "headphone" },
        { name: "Power Supply", category: "power-supply" },
        { name: "Monitor", category: "monitor" },
        { name: "Vonage", category: "vonage" },
      ];

      for (const { name, category } of categories) {
        const categoryData = systemAssetsData
          .filter((asset: any) => asset.category === category)
          .map((asset: any) => {
            const baseData = {
              "Asset ID": asset.id,
              "Serial Number": asset.serialNumber || "-",
              "Vendor Name": asset.vendorName || "-",
              "Company Name": asset.companyName || "-",
              "Purchase Date": asset.purchaseDate
                ? new Date(asset.purchaseDate).toLocaleDateString()
                : "-",
              "Warranty End Date": asset.warrantyEndDate
                ? new Date(asset.warrantyEndDate).toLocaleDateString()
                : "-",
              "Created Date": new Date(asset.createdAt).toLocaleDateString(),
            };

            // Add category-specific fields
            if (category === "ram") {
              return {
                ...baseData,
                "RAM Size": asset.ramSize || "-",
                "RAM Type": asset.ramType || "-",
              };
            } else if (category === "motherboard") {
              return {
                ...baseData,
                "Processor Model": asset.processorModel || "-",
              };
            } else if (category === "storage") {
              return {
                ...baseData,
                "Storage Type": asset.storageType || "-",
                "Storage Capacity": asset.storageCapacity || "-",
              };
            } else if (category === "vonage") {
              return {
                ...baseData,
                "Vonage Number": asset.vonageNumber || "-",
                "Extension Code": asset.vonageExtCode || "-",
                Password: asset.vonagePassword || "-",
              };
            }

            return baseData;
          });

        if (categoryData.length > 0) {
          let headers = [
            "Asset ID",
            "Serial Number",
            "Vendor Name",
            "Company Name",
            "Purchase Date",
            "Warranty End Date",
            "Created Date",
          ];

          if (category === "ram") {
            headers.push("RAM Size", "RAM Type");
          } else if (category === "motherboard") {
            headers.push("Processor Model");
          } else if (category === "storage") {
            headers.push("Storage Type", "Storage Capacity");
          } else if (category === "vonage") {
            headers.push("Vonage Number", "Extension Code", "Password");
          }

          await this.updateSheet(name, categoryData, headers);
        }
      }

      // 4. Summary Sheet
      const summaryData = [
        { "Data Type": "Total PC/Laptops", Count: pcLaptopData.length },
        { "Data Type": "Total System Assets", Count: systemAssetsData.length },
        ...categories.map(({ name, category }) => ({
          "Data Type": `${name} Assets`,
          Count: systemAssetsData.filter(
            (asset: any) => asset.category === category,
          ).length,
        })),
      ];

      await this.updateSheet("Summary", summaryData, ["Data Type", "Count"]);

      return { success: true, spreadsheetId: this.spreadsheetId };
    } catch (error) {
      console.error("Failed to sync data to Google Sheets:", error);
      throw error;
    }
  }

  // Get spreadsheet URL
  getSpreadsheetUrl() {
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`;
  }
}

// Create global instance
const googleSheetsService = new GoogleSheetsService();

// API route handlers
export const syncToGoogleSheets: RequestHandler = async (req, res) => {
  try {
    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
      return res.status(503).json({
        success: false,
        message:
          "Google Sheets is not configured. Please set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable.",
      });
    }

    const { pcLaptopData, systemAssetsData } = req.body;

    const result = await googleSheetsService.syncAllData(
      pcLaptopData,
      systemAssetsData,
    );

    res.json({
      success: true,
      message: "Data synced to Google Sheets successfully",
      spreadsheetUrl: googleSheetsService.getSpreadsheetUrl(),
      ...result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync to Google Sheets",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSpreadsheetInfo: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      spreadsheetId: googleSheetsService.spreadsheetId,
      spreadsheetUrl: googleSheetsService.getSpreadsheetUrl(),
      isConfigured:
        !!process.env.GOOGLE_SHEET_ID &&
        !!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get spreadsheet info",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
