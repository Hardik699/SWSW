// Google Apps Script for PC/Laptop Asset Management Auto-Sync
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
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Data synced successfully to Google Sheets",
        timestamp: new Date().toISOString(),
        recordsProcessed: {
          pcLaptops: pcLaptopData.length,
          systemAssets: systemAssetsData.length,
        },
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function updatePCLaptopSheet(spreadsheet, pcLaptopData, systemAssetsData) {
  let sheet = spreadsheet.getSheetByName("PC-Laptop Info");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("PC-Laptop Info");
  }

  // Clear existing content
  sheet.clear();

  // Headers
  const headers = [
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
  ];

  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.getRange(1, 1, 1, headers.length).setBackground("#4285f4");
  sheet.getRange(1, 1, 1, headers.length).setFontColor("white");

  // Process PC/Laptop data
  if (pcLaptopData.length > 0) {
    const rows = pcLaptopData.map((item) => {
      // Get storage details
      const storageDetails = item.storageId
        ? systemAssetsData.find((s) => s.id === item.storageId)
        : null;

      // Get RAM details
      const ram1Details = item.ramId
        ? systemAssetsData.find((s) => s.id === item.ramId)
        : null;
      const ram2Details = item.ramId2
        ? systemAssetsData.find((s) => s.id === item.ramId2)
        : null;

      // Calculate total RAM
      let totalRam = 0;
      if (ram1Details?.ramSize) {
        totalRam += parseInt(ram1Details.ramSize.replace(/[^0-9]/g, "")) || 0;
      }
      if (ram2Details?.ramSize) {
        totalRam += parseInt(ram2Details.ramSize.replace(/[^0-9]/g, "")) || 0;
      }

      return [
        item.id,
        item.mouseId || "-",
        item.keyboardId || "-",
        item.motherboardId || "-",
        item.cameraId || "-",
        item.headphoneId || "-",
        item.powerSupplyId || "-",
        item.storageId || "-",
        storageDetails?.storageType || "-",
        storageDetails?.storageCapacity || "-",
        item.ramId || "-",
        ram1Details?.ramSize || "-",
        item.ramId2 || "-",
        ram2Details?.ramSize || "-",
        totalRam > 0 ? `${totalRam}GB` : "-",
        new Date(item.createdAt).toLocaleDateString(),
      ];
    });

    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

function updateSystemAssetsSheet(spreadsheet, systemAssetsData) {
  let sheet = spreadsheet.getSheetByName("All System Assets");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("All System Assets");
  }

  // Clear existing content
  sheet.clear();

  // Headers
  const headers = [
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
  ];

  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.getRange(1, 1, 1, headers.length).setBackground("#34a853");
  sheet.getRange(1, 1, 1, headers.length).setFontColor("white");

  // Process system assets data
  if (systemAssetsData.length > 0) {
    const rows = systemAssetsData.map((asset) => [
      asset.id,
      asset.category,
      asset.serialNumber || "-",
      asset.vendorName || "-",
      asset.companyName || "-",
      asset.purchaseDate
        ? new Date(asset.purchaseDate).toLocaleDateString()
        : "-",
      asset.warrantyEndDate
        ? new Date(asset.warrantyEndDate).toLocaleDateString()
        : "-",
      asset.ramSize || "-",
      asset.ramType || "-",
      asset.processorModel || "-",
      asset.storageType || "-",
      asset.storageCapacity || "-",
      asset.vonageNumber || "-",
      asset.vonageExtCode || "-",
      asset.vonagePassword || "-",
      new Date(asset.createdAt).toLocaleDateString(),
    ]);

    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

function updateCategorySheets(spreadsheet, systemAssetsData) {
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

  categories.forEach(({ name, category }) => {
    const categoryData = systemAssetsData.filter(
      (asset) => asset.category === category,
    );

    if (categoryData.length > 0) {
      let sheet = spreadsheet.getSheetByName(name);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(name);
      }

      // Clear existing content
      sheet.clear();

      // Base headers
      let headers = [
        "Asset ID",
        "Serial Number",
        "Vendor Name",
        "Company Name",
        "Purchase Date",
        "Warranty End Date",
        "Created Date",
      ];

      // Add category-specific headers
      if (category === "ram") {
        headers.push("RAM Size", "RAM Type");
      } else if (category === "motherboard") {
        headers.push("Processor Model");
      } else if (category === "storage") {
        headers.push("Storage Type", "Storage Capacity");
      } else if (category === "vonage") {
        headers.push("Vonage Number", "Extension Code", "Password");
      }

      // Set headers
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.getRange(1, 1, 1, headers.length).setBackground("#ff9800");
      sheet.getRange(1, 1, 1, headers.length).setFontColor("white");

      // Process category data
      const rows = categoryData.map((asset) => {
        const baseData = [
          asset.id,
          asset.serialNumber || "-",
          asset.vendorName || "-",
          asset.companyName || "-",
          asset.purchaseDate
            ? new Date(asset.purchaseDate).toLocaleDateString()
            : "-",
          asset.warrantyEndDate
            ? new Date(asset.warrantyEndDate).toLocaleDateString()
            : "-",
          new Date(asset.createdAt).toLocaleDateString(),
        ];

        // Add category-specific data
        if (category === "ram") {
          baseData.push(asset.ramSize || "-", asset.ramType || "-");
        } else if (category === "motherboard") {
          baseData.push(asset.processorModel || "-");
        } else if (category === "storage") {
          baseData.push(asset.storageType || "-", asset.storageCapacity || "-");
        } else if (category === "vonage") {
          baseData.push(
            asset.vonageNumber || "-",
            asset.vonageExtCode || "-",
            asset.vonagePassword || "-",
          );
        }

        return baseData;
      });

      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

      // Auto-resize columns
      sheet.autoResizeColumns(1, headers.length);
    }
  });
}

function updateSummarySheet(spreadsheet, pcLaptopData, systemAssetsData) {
  let sheet = spreadsheet.getSheetByName("Summary");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Summary");
  }

  // Clear existing content
  sheet.clear();

  // Headers
  const headers = ["Data Type", "Count"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.getRange(1, 1, 1, headers.length).setBackground("#9c27b0");
  sheet.getRange(1, 1, 1, headers.length).setFontColor("white");

  // Summary data
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

  const summaryData = [
    ["Total PC/Laptops", pcLaptopData.length],
    ["Total System Assets", systemAssetsData.length],
    ...categories.map(({ name, category }) => [
      `${name} Assets`,
      systemAssetsData.filter((asset) => asset.category === category).length,
    ]),
    ["Last Updated", new Date().toLocaleString()],
  ];

  sheet.getRange(2, 1, summaryData.length, 2).setValues(summaryData);

  // Auto-resize columns
  sheet.autoResizeColumns(1, 2);
}

// Test function (optional)
function testSync() {
  const testData = {
    pcLaptopData: [],
    systemAssetsData: [],
    action: "test",
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData),
    },
  };

  const result = doPost(e);
  console.log(result.getContent());
}
