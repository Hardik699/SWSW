import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Download,
  RefreshCw,
  ExternalLink,
  Settings,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  googleAppsScriptSync,
  useGoogleAppsScriptAutoSync,
} from "@/lib/googleAppsScriptSync";

type Asset = {
  id: string;
  createdAt: string;
  systemType?: string;
  totalRam?: string;
  mouseId?: string;
  keyboardId?: string;
  motherboardId?: string;
  cameraId?: string;
  headphoneId?: string;
  powerSupplyId?: string;
  storageId?: string;
  ramId?: string;
  ramId2?: string;
};

type SysAsset = {
  id: string;
  category: string;
  storageType?: string;
  storageCapacity?: string;
};

const STORAGE_KEY = "pcLaptopAssets";
const SYS_STORAGE_KEY = "systemAssets";

function getDeviceTypeCode(systemType: string): string {
  switch (systemType) {
    case "Laptop":
      return "L";
    case "Desktop PC":
      return "D";
    case "All In One PC":
      return "A";
    default:
      return "X"; // Default code for unknown types
  }
}

function nextWxId(list: Asset[], systemType?: string): string {
  const code = systemType ? getDeviceTypeCode(systemType) : "X";
  let max = 0;

  for (const a of list) {
    // Match both old format (WX-001) and new format (WX-L-001)
    const newFormatMatch = a.id.match(new RegExp(`^WX-${code}-(\\d+)$`));
    if (newFormatMatch) {
      const n = parseInt(newFormatMatch[1], 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }

  const next = String(max + 1).padStart(3, "0");
  return `WX-${code}-${next}`;
}

export default function PCLaptopInfo() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Asset[]>([]);
  const [mouseAssets, setMouseAssets] = useState<SysAsset[]>([]);
  const [keyboardAssets, setKeyboardAssets] = useState<SysAsset[]>([]);
  const [motherboardAssets, setMotherboardAssets] = useState<SysAsset[]>([]);
  const [cameraAssets, setCameraAssets] = useState<SysAsset[]>([]);
  const [headphoneAssets, setHeadphoneAssets] = useState<SysAsset[]>([]);
  const [powerSupplyAssets, setPowerSupplyAssets] = useState<SysAsset[]>([]);
  const [storageAssets, setStorageAssets] = useState<SysAsset[]>([]);
  const [ramAssets, setRamAssets] = useState<SysAsset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | null>(null);
  const [form, setForm] = useState({
    id: "",
    systemType: "",
    totalRam: "",
    mouseId: "",
    keyboardId: "",
    motherboardId: "",
    cameraId: "",
    headphoneId: "",
    powerSupplyId: "",
    storageId: "",
    ramId: "",
    ramId2: "",
  });
  const [totalRam, setTotalRam] = useState("0GB");
  const [isGoogleSheetsConfigured, setIsGoogleSheetsConfigured] =
    useState(false);
  const [systemAssets, setSystemAssets] = useState<SysAsset[]>([]);
  const [allSystemAssets, setAllSystemAssets] = useState<SysAsset[]>([]);
  const { triggerAutoSync } = useGoogleAppsScriptAutoSync();

  // Check Google Apps Script configuration on load
  useEffect(() => {
    const configured = googleAppsScriptSync.isReady();
    setIsGoogleSheetsConfigured(configured);
  }, []);

  // Helper function to get used IDs for a specific component type
  const getUsedIds = (items: Asset[], field: keyof Asset): string[] => {
    return items
      .map((item) => item[field])
      .filter((id): id is string => !!id && id !== "none");
  };

  // Helper function to filter available assets (not used)
  const getAvailableAssets = (
    allAssets: SysAsset[],
    usedIds: string[],
  ): SysAsset[] => {
    return allAssets.filter((asset) => !usedIds.includes(asset.id));
  };

  // Helper function to get asset details by ID
  const getAssetById = (id: string): SysAsset | undefined => {
    return allSystemAssets.find((asset) => asset.id === id);
  };

  // Helper function to get available assets for a specific component type
  // This dynamically computes what's available based on current state
  const getAvailableForComponent = (
    category: string,
    currentAssignedId?: string
  ): SysAsset[] => {
    // Get all items to check (excluding current if editing)
    const itemsToCheck = editingItem
      ? items.filter((item) => item.id !== editingItem.id)
      : items;

    // Get all assets of this category
    const allAssetsOfType = allSystemAssets.filter(
      (asset) => asset.category === category
    );

    // Get used IDs for this category
    let usedIds: string[] = [];

    switch (category) {
      case "mouse":
        usedIds = getUsedIds(itemsToCheck, "mouseId");
        break;
      case "keyboard":
        usedIds = getUsedIds(itemsToCheck, "keyboardId");
        break;
      case "motherboard":
        usedIds = getUsedIds(itemsToCheck, "motherboardId");
        break;
      case "camera":
        usedIds = getUsedIds(itemsToCheck, "cameraId");
        break;
      case "headphone":
        usedIds = getUsedIds(itemsToCheck, "headphoneId");
        break;
      case "power-supply":
        usedIds = getUsedIds(itemsToCheck, "powerSupplyId");
        break;
      case "storage":
        usedIds = getUsedIds(itemsToCheck as any, "storageId" as any);
        break;
      case "ram":
        usedIds = Array.from(
          new Set([
            ...getUsedIds(itemsToCheck, "ramId"),
            ...getUsedIds(itemsToCheck as any, "ramId2" as any),
          ])
        );
        break;
    }

    // Remove the current assignment from the used list (so it can be kept)
    if (currentAssignedId && currentAssignedId !== "none") {
      usedIds = usedIds.filter((id) => id !== currentAssignedId);
    }

    // Return only available assets
    return allAssetsOfType.filter((asset) => !usedIds.includes(asset.id));
  };

  // Calculate total RAM whenever RAM selections change
  const calculateTotalRam = () => {
    let total = 0;

    // Get RAM 1 size
    if (form.ramId && form.ramId !== "none") {
      const ram1Details = ramAssets.find((item: any) => item.id === form.ramId);
      if (ram1Details?.ramSize) {
        const size1 = parseInt(ram1Details.ramSize.replace(/[^0-9]/g, "")) || 0;
        total += size1;
      }
    }

    // Get RAM 2 size
    if (form.ramId2 && form.ramId2 !== "none") {
      const ram2Details = ramAssets.find(
        (item: any) => item.id === form.ramId2,
      );
      if (ram2Details?.ramSize) {
        const size2 = parseInt(ram2Details.ramSize.replace(/[^0-9]/g, "")) || 0;
        total += size2;
      }
    }

    return total > 0 ? `${total}GB` : "0GB";
  };

  // Update total RAM when RAM selections change
  useEffect(() => {
    setTotalRam(calculateTotalRam());
  }, [form.ramId, form.ramId2, ramAssets]);

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      // Fetch PC/Laptop data from API
      const pcResponse = await fetch("/api/pc-laptop");
      const pcResult = await pcResponse.json();
      const pcLaptopData = pcResult.success ? pcResult.data : [];

      // Fetch system assets from API
      const assetsResponse = await fetch("/api/system-assets");
      const assetsResult = await assetsResponse.json();
      const systemAssetsData = assetsResult.success ? assetsResult.data : [];

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // 1. PC/Laptop Info Sheet
      const pcLaptopSheet = pcLaptopData.map((item: Asset) => {
        const sysAssets = systemAssetsData;

        // Get storage details
        const storageDetails = item.storageId
          ? sysAssets.find((s: any) => s.id === item.storageId)
          : null;

        // Get RAM details
        const ram1Details = item.ramId
          ? sysAssets.find((s: any) => s.id === item.ramId)
          : null;
        const ram2Details = (item as any).ramId2
          ? sysAssets.find((s: any) => s.id === (item as any).ramId2)
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
          "RAM Slot 2 ID": (item as any).ramId2 || "-",
          "RAM Slot 2 Size": ram2Details?.ramSize || "-",
          "Total RAM": totalRam > 0 ? `${totalRam}GB` : "-",
          "Created Date": new Date(item.createdAt).toLocaleDateString(),
        };
      });

      const pcLaptopWS = XLSX.utils.json_to_sheet(pcLaptopSheet);
      XLSX.utils.book_append_sheet(workbook, pcLaptopWS, "PC-Laptop Info");

      // 2. Create sheets for each asset category
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
        const categoryData = systemAssetsData
          .filter((asset: any) => asset.category === category)
          .map((asset: any) => {
            const baseData = {
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
          const categoryWS = XLSX.utils.json_to_sheet(categoryData);
          XLSX.utils.book_append_sheet(workbook, categoryWS, name);
        }
      });

      // 3. Summary Sheet
      const summaryData = [
        { "Data Type": "Total PC/Laptops", Count: pcLaptopData.length },
        ...categories.map(({ name, category }) => ({
          "Data Type": `Total ${name}`,
          Count: systemAssetsData.filter(
            (asset: any) => asset.category === category,
          ).length,
        })),
      ];

      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWS, "Summary");

      // Generate filename with current date
      const now = new Date();
      const filename = `PC_Laptop_Assets_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.xlsx`;

      // Write the file
      XLSX.writeFile(workbook, filename);

      alert(`Excel file exported successfully: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  useEffect(() => {
    // Reset editing state on component load
    setEditingItem(null);
    setShowForm(false);

    // Fetch PC/Laptop data from database API ONLY
    const fetchPCLaptopData = async () => {
      try {
        const response = await fetch("/api/pc-laptop");
        const result = await response.json();
        let currentItems: Asset[] = [];

        if (result.success && result.data) {
          // Map MongoDB data
          currentItems = result.data.map((item: any) => ({
            ...item,
            id: item.id || item._id,
          }));
        }

        setItems(currentItems);

        // Fetch system assets from API
        fetchSystemAssetsData(currentItems);
      } catch (error) {
        console.error("Failed to fetch PC/Laptop data from database:", error);
        // No fallback - show empty if database fails
        setItems([]);
        fetchSystemAssetsData([]);
      }
    };

    const fetchSystemAssetsData = async (currentItems: Asset[]) => {
      try {
        const response = await fetch("/api/system-assets");
        const result = await response.json();
        const sysList: SysAsset[] = result.success ? result.data : [];

        // Store all system assets for lookups
        setAllSystemAssets(sysList);

        // Get all used IDs for each component type
        const usedMouseIds = getUsedIds(currentItems, "mouseId");
        const usedKeyboardIds = getUsedIds(currentItems, "keyboardId");
        const usedMotherboardIds = getUsedIds(currentItems, "motherboardId");
        const usedCameraIds = getUsedIds(currentItems, "cameraId");
        const usedHeadphoneIds = getUsedIds(currentItems, "headphoneId");
        const usedPowerSupplyIds = getUsedIds(currentItems, "powerSupplyId");
        const usedStorageIds = getUsedIds(
          currentItems as any,
          "storageId" as any,
        );
        const usedRamIds = Array.from(
          new Set([
            ...getUsedIds(currentItems, "ramId"),
            ...getUsedIds(currentItems as any, "ramId2" as any),
          ]),
        );

        // Filter out used IDs from available assets
        const allMouseAssets = sysList.filter((s) => s.category === "mouse");
        const allKeyboardAssets = sysList.filter(
          (s) => s.category === "keyboard",
        );
        const allMotherboardAssets = sysList.filter(
          (s) => s.category === "motherboard",
        );
        const allCameraAssets = sysList.filter((s) => s.category === "camera");
        const allHeadphoneAssets = sysList.filter(
          (s) => s.category === "headphone",
        );
        const allPowerSupplyAssets = sysList.filter(
          (s) => s.category === "power-supply",
        );
        const allStorageAssets = sysList.filter(
          (s) => s.category === "storage",
        );
        const allRamAssets = sysList.filter((s) => s.category === "ram");

        setMouseAssets(getAvailableAssets(allMouseAssets, usedMouseIds));
        setKeyboardAssets(
          getAvailableAssets(allKeyboardAssets, usedKeyboardIds),
        );
        setMotherboardAssets(
          getAvailableAssets(allMotherboardAssets, usedMotherboardIds),
        );
        setCameraAssets(getAvailableAssets(allCameraAssets, usedCameraIds));
        setHeadphoneAssets(
          getAvailableAssets(allHeadphoneAssets, usedHeadphoneIds),
        );
        setPowerSupplyAssets(
          getAvailableAssets(allPowerSupplyAssets, usedPowerSupplyIds),
        );
        setStorageAssets(getAvailableAssets(allStorageAssets, usedStorageIds));
        setRamAssets(getAvailableAssets(allRamAssets, usedRamIds));
      } catch (error) {
        console.error("Failed to fetch system assets:", error);
        setMouseAssets([]);
        setKeyboardAssets([]);
        setMotherboardAssets([]);
        setCameraAssets([]);
        setHeadphoneAssets([]);
        setPowerSupplyAssets([]);
        setStorageAssets([]);
        setRamAssets([]);
      }
    };

    fetchPCLaptopData();
  }, []);

  const addNew = () => {
    // Force reset all edit state
    setEditingItem(null);
    setShowForm(false);

    // Then open form in add mode
    openForm();
  };

  const openForm = async (itemToEdit?: Asset) => {
    // Reset form state first
    if (!itemToEdit) {
      setEditingItem(null);
    }

    // Use current items from state (which comes from database)
    const currentItems = items;

    try {
      const response = await fetch("/api/system-assets");
      const result = await response.json();
      const sysList: SysAsset[] = result.success ? result.data : [];

      // Get all used IDs for each component type
      // When editing, exclude the current item's IDs from "used" so they appear as available
      const itemsToCheck = itemToEdit
        ? currentItems.filter((item) => item.id !== itemToEdit.id)
        : currentItems;

      const usedMouseIds = getUsedIds(itemsToCheck, "mouseId");
      const usedKeyboardIds = getUsedIds(itemsToCheck, "keyboardId");
      const usedMotherboardIds = getUsedIds(itemsToCheck, "motherboardId");
      const usedCameraIds = getUsedIds(itemsToCheck, "cameraId");
      const usedHeadphoneIds = getUsedIds(itemsToCheck, "headphoneId");
      const usedPowerSupplyIds = getUsedIds(itemsToCheck, "powerSupplyId");
      const usedStorageIds = getUsedIds(
        itemsToCheck as any,
        "storageId" as any,
      );
      const usedRamIds = Array.from(
        new Set([
          ...getUsedIds(itemsToCheck, "ramId"),
          ...getUsedIds(itemsToCheck as any, "ramId2" as any),
        ]),
      );

      // Get fresh available assets
      const freshMouseAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "mouse"),
        usedMouseIds,
      );
      const freshKeyboardAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "keyboard"),
        usedKeyboardIds,
      );
      const freshMotherboardAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "motherboard"),
        usedMotherboardIds,
      );
      const freshCameraAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "camera"),
        usedCameraIds,
      );
      const freshHeadphoneAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "headphone"),
        usedHeadphoneIds,
      );
      const freshPowerSupplyAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "power-supply"),
        usedPowerSupplyIds,
      );
      const freshStorageAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "storage"),
        usedStorageIds,
      );
      const freshRamAssets = getAvailableAssets(
        sysList.filter((s) => s.category === "ram"),
        usedRamIds,
      );

      // Update state with fresh data
      setMouseAssets(freshMouseAssets);
      setKeyboardAssets(freshKeyboardAssets);
      setMotherboardAssets(freshMotherboardAssets);
      setCameraAssets(freshCameraAssets);
      setHeadphoneAssets(freshHeadphoneAssets);
      setPowerSupplyAssets(freshPowerSupplyAssets);
      setStorageAssets(freshStorageAssets);
      setRamAssets(freshRamAssets);
    } catch (error) {
      console.error("Failed to fetch system assets:", error);
      setMouseAssets([]);
      setKeyboardAssets([]);
      setMotherboardAssets([]);
      setCameraAssets([]);
      setHeadphoneAssets([]);
      setPowerSupplyAssets([]);
      setStorageAssets([]);
      setRamAssets([]);
    }

    if (itemToEdit) {
      // Edit mode - populate form with existing data
      setEditingItem(itemToEdit);
      setForm({
        id: itemToEdit.id,
        systemType: itemToEdit.systemType || "",
        totalRam: itemToEdit.totalRam || "",
        mouseId: itemToEdit.mouseId || "none",
        keyboardId: itemToEdit.keyboardId || "none",
        motherboardId: itemToEdit.motherboardId || "none",
        cameraId: itemToEdit.cameraId || "none",
        headphoneId: itemToEdit.headphoneId || "none",
        powerSupplyId: itemToEdit.powerSupplyId || "none",
        storageId: (itemToEdit as any).storageId || "none",
        ramId: itemToEdit.ramId || "none",
        ramId2: itemToEdit.ramId2 || "none",
      });
    } else {
      // Add mode - generate new ID and set defaults
      // Generate ID with default code for now, will be updated when user selects system type
      const id = nextWxId(currentItems, "");
      setEditingItem(null);
      setForm({
        id,
        systemType: "",
        totalRam: "",
        mouseId: "none",
        keyboardId: "none",
        motherboardId: "none",
        cameraId: "none",
        headphoneId: "none",
        powerSupplyId: "none",
        storageId: "none",
        ramId: "none",
        ramId2: "none",
      });
    }
    setShowForm(true);

    // Debug log to verify mode
    console.log(
      "Form opened in mode:",
      itemToEdit ? "EDIT" : "ADD",
      "Item:",
      itemToEdit?.id || "none",
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    // In edit mode, always keep the original ID. In add mode, use form.id (which was generated)
    const recordId = editingItem ? editingItem.id : form.id;

    const record: Asset = {
      id: recordId,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      systemType: form.systemType ? form.systemType.trim() : undefined,
      totalRam: form.totalRam ? form.totalRam.trim() : undefined,
      mouseId:
        form.mouseId && form.mouseId !== "none"
          ? form.mouseId.trim()
          : undefined,
      keyboardId:
        form.keyboardId && form.keyboardId !== "none"
          ? form.keyboardId.trim()
          : undefined,
      motherboardId:
        form.motherboardId && form.motherboardId !== "none"
          ? form.motherboardId.trim()
          : undefined,
      cameraId:
        form.cameraId && form.cameraId !== "none"
          ? form.cameraId.trim()
          : undefined,
      headphoneId:
        form.headphoneId && form.headphoneId !== "none"
          ? form.headphoneId.trim()
          : undefined,
      powerSupplyId:
        form.powerSupplyId && form.powerSupplyId !== "none"
          ? form.powerSupplyId.trim()
          : undefined,
      storageId:
        (form as any).storageId && (form as any).storageId !== "none"
          ? (form as any).storageId.trim()
          : undefined,
      ramId:
        form.ramId && form.ramId !== "none" ? form.ramId.trim() : undefined,
      ramId2:
        form.ramId2 && form.ramId2 !== "none" ? form.ramId2.trim() : undefined,
    };

    let next: Asset[];
    if (editingItem) {
      // Update existing item
      next = items.map((item) => (item.id === editingItem.id ? record : item));
    } else {
      // Add new item
      next = [record, ...items];
    }

    // Save to database API ONLY (no localStorage)
    try {
      if (editingItem) {
        // Update existing record in database
        await fetch(`/api/pc-laptop/${record.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
      } else {
        // Create new record in database
        await fetch("/api/pc-laptop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });
      }
      // Only update state after successful database save
      setItems(next);
    } catch (error) {
      console.error("Failed to save to database:", error);
      alert("Failed to save to database. Please try again.");
      return; // Don't update state if save fails
    }

    // Refresh available assets after saving from API
    try {
      const response = await fetch("/api/system-assets");
      const result = await response.json();
      const sysList: SysAsset[] = result.success ? result.data : [];

      // Get all used IDs including the one we just saved
      const usedMouseIds = getUsedIds(next, "mouseId");
      const usedKeyboardIds = getUsedIds(next, "keyboardId");
      const usedMotherboardIds = getUsedIds(next, "motherboardId");
      const usedCameraIds = getUsedIds(next, "cameraId");
      const usedHeadphoneIds = getUsedIds(next, "headphoneId");
      const usedPowerSupplyIds = getUsedIds(next, "powerSupplyId");
      const usedStorageIds = getUsedIds(next as any, "storageId" as any);
      const usedRamIds = Array.from(
        new Set([
          ...getUsedIds(next, "ramId"),
          ...getUsedIds(next as any, "ramId2" as any),
        ]),
      );

      // Update available assets
      setMouseAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "mouse"),
          usedMouseIds,
        ),
      );
      setKeyboardAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "keyboard"),
          usedKeyboardIds,
        ),
      );
      setMotherboardAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "motherboard"),
          usedMotherboardIds,
        ),
      );
      setCameraAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "camera"),
          usedCameraIds,
        ),
      );
      setHeadphoneAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "headphone"),
          usedHeadphoneIds,
        ),
      );
      setPowerSupplyAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "power-supply"),
          usedPowerSupplyIds,
        ),
      );
      setStorageAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "storage"),
          usedStorageIds,
        ),
      );
      setRamAssets(
        getAvailableAssets(
          sysList.filter((s) => s.category === "ram"),
          usedRamIds,
        ),
      );
    } catch (error) {
      console.error("Failed to refresh system assets:", error);
    }

    setShowForm(false);
    setEditingItem(null);

    // Reset form to clear any residual state
    setForm({
      id: "",
      systemType: "",
      totalRam: "",
      mouseId: "none",
      keyboardId: "none",
      motherboardId: "none",
      cameraId: "none",
      headphoneId: "none",
      powerSupplyId: "none",
      storageId: "none",
      ramId: "none",
      ramId2: "none",
    });

    // Auto-sync to Google Sheets if configured
    if (isGoogleSheetsConfigured) {
      triggerAutoSync();
    }

    alert(editingItem ? "Updated successfully!" : "Saved successfully!");
  };

  const deleteItem = async (itemToDelete: Asset) => {
    // Ask for password confirmation
    const password = window.prompt(
      `Enter password to delete ${itemToDelete.id}:\n(This action cannot be undone)`
    );

    // If user cancelled or didn't enter anything
    if (password === null) {
      return;
    }

    // Check password (using "1" as the password)
    if (password !== "1") {
      alert("Incorrect password!");
      return;
    }

    try {
      // Delete from database
      const deleteResponse = await fetch(`/api/pc-laptop/${itemToDelete.id}`, {
        method: "DELETE",
      });

      // Check if deletion was successful
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        const errorMessage = errorData.error || `Delete failed with status ${deleteResponse.status}`;
        throw new Error(errorMessage);
      }

      const result = await deleteResponse.json();
      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }

      // Remove from state ONLY after successful deletion
      const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
      setItems(updatedItems);

      // Refresh available assets after deletion
      try {
        const response = await fetch("/api/system-assets");
        const result = await response.json();
        const sysList: SysAsset[] = result.success ? result.data : [];

        // Get all used IDs from remaining items
        const usedMouseIds = getUsedIds(updatedItems, "mouseId");
        const usedKeyboardIds = getUsedIds(updatedItems, "keyboardId");
        const usedMotherboardIds = getUsedIds(
          updatedItems,
          "motherboardId"
        );
        const usedCameraIds = getUsedIds(updatedItems, "cameraId");
        const usedHeadphoneIds = getUsedIds(updatedItems, "headphoneId");
        const usedPowerSupplyIds = getUsedIds(updatedItems, "powerSupplyId");
        const usedStorageIds = getUsedIds(updatedItems as any, "storageId" as any);
        const usedRamIds = Array.from(
          new Set([
            ...getUsedIds(updatedItems, "ramId"),
            ...getUsedIds(updatedItems as any, "ramId2" as any),
          ]),
        );

        // Update available assets
        setMouseAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "mouse"),
            usedMouseIds,
          ),
        );
        setKeyboardAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "keyboard"),
            usedKeyboardIds,
          ),
        );
        setMotherboardAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "motherboard"),
            usedMotherboardIds,
          ),
        );
        setCameraAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "camera"),
            usedCameraIds,
          ),
        );
        setHeadphoneAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "headphone"),
            usedHeadphoneIds,
          ),
        );
        setPowerSupplyAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "power-supply"),
            usedPowerSupplyIds,
          ),
        );
        setStorageAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "storage"),
            usedStorageIds,
          ),
        );
        setRamAssets(
          getAvailableAssets(
            sysList.filter((s) => s.category === "ram"),
            usedRamIds,
          ),
        );
      } catch (error) {
        console.error("Failed to refresh system assets:", error);
      }

      alert("Deleted successfully!");
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 self-start"
              title="Go back to previous page"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                PC/Laptop Info
              </h1>
              <p className="text-slate-400">Manage PCs and laptops</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
            <Button
              onClick={addNew}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
            >
              Add
            </Button>
            <Button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            {isGoogleSheetsConfigured && (
              <Button
                onClick={() => googleAppsScriptSync.manualSync()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2 w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Sync to Sheets
              </Button>
            )}
            {!isGoogleSheetsConfigured && (
              <Button
                onClick={() => navigate("/google-apps-script-config")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 w-full sm:w-auto"
              >
                <Settings className="h-4 w-4" />
                Setup Sync
              </Button>
            )}
            <Button
              onClick={() => navigate("/")}
              className="bg-slate-700 hover:bg-slate-600 text-white w-full sm:w-auto"
            >
              Home
            </Button>
          </div>
        </header>

        {showForm && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                {editingItem
                  ? `Edit PC/Laptop - ${editingItem.id}`
                  : "Add PC/Laptop"}
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Only available (unused) component IDs are shown. Already
                assigned IDs are automatically filtered out.
              </p>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={save}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label className="text-slate-300">ID</Label>
                  <Input
                    value={form.id}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">System Type</Label>
                  <Select
                    value={form.systemType}
                    onValueChange={(v) => {
                      // Update system type and regenerate ID if in add mode
                      if (!editingItem) {
                        const newId = nextWxId(items, v);
                        setForm((s) => ({ ...s, systemType: v, id: newId }));
                      } else {
                        setForm((s) => ({ ...s, systemType: v }));
                      }
                    }}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="Desktop PC">Desktop PC</SelectItem>
                      <SelectItem value="All In One PC">
                        All In One PC
                      </SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Total RAM</Label>
                  <Input
                    value={form.totalRam}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, totalRam: e.target.value }))
                    }
                    placeholder="e.g., 16GB, 32GB"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Mouse (IDs)</Label>
                  <Select
                    value={form.mouseId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, mouseId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("mouse", form.mouseId).length
                            ? "Select available mouse"
                            : "No available mouse"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No Mouse --</span>
                      </SelectItem>
                      {getAvailableForComponent("mouse", form.mouseId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available mouse items
                        </div>
                      ) : (
                        getAvailableForComponent("mouse", form.mouseId).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Keyboard (IDs)</Label>
                  <Select
                    value={form.keyboardId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, keyboardId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("keyboard", form.keyboardId).length
                            ? "Select available keyboard"
                            : "No available keyboard"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Keyboard --
                        </span>
                      </SelectItem>
                      {getAvailableForComponent("keyboard", form.keyboardId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available keyboard items
                        </div>
                      ) : (
                        getAvailableForComponent("keyboard", form.keyboardId).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Motherboard (IDs)</Label>
                  <Select
                    value={form.motherboardId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, motherboardId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("motherboard", form.motherboardId).length
                            ? "Select available motherboard"
                            : "No available motherboard"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Motherboard --
                        </span>
                      </SelectItem>
                      {getAvailableForComponent("motherboard", form.motherboardId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available motherboard items
                        </div>
                      ) : (
                        getAvailableForComponent("motherboard", form.motherboardId).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Camera (IDs)</Label>
                  <Select
                    value={form.cameraId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, cameraId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("camera", form.cameraId).length
                            ? "Select available camera"
                            : "No available camera"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No Camera --</span>
                      </SelectItem>
                      {getAvailableForComponent("camera", form.cameraId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available camera items
                        </div>
                      ) : (
                        getAvailableForComponent("camera", form.cameraId).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Headphone (IDs)</Label>
                  <Select
                    value={form.headphoneId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, headphoneId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("headphone", form.headphoneId).length
                            ? "Select available headphone"
                            : "No available headphone"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Headphone --
                        </span>
                      </SelectItem>
                      {getAvailableForComponent("headphone", form.headphoneId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available headphone items
                        </div>
                      ) : (
                        getAvailableForComponent("headphone", form.headphoneId).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Power Supply (IDs)</Label>
                  <Select
                    value={form.powerSupplyId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, powerSupplyId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("power-supply", form.powerSupplyId).length
                            ? "Select available power supply"
                            : "No available power supply"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">
                          -- No Power Supply --
                        </span>
                      </SelectItem>
                      {getAvailableForComponent("power-supply", form.powerSupplyId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available power supply items
                        </div>
                      ) : (
                        getAvailableForComponent("power-supply", form.powerSupplyId).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">RAM (IDs)</Label>
                  <Select
                    value={form.ramId}
                    onValueChange={(v) => setForm((s) => ({ ...s, ramId: v }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("ram", form.ramId).length
                            ? "Select available RAM"
                            : "No available RAM"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No RAM --</span>
                      </SelectItem>
                      {getAvailableForComponent("ram", form.ramId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available RAM items
                        </div>
                      ) : (
                        getAvailableForComponent("ram", form.ramId).map((m) => {
                          const ramDetails = getAssetById(m.id);

                          return (
                            <SelectItem key={m.id} value={m.id}>
                              {m.id} ({ramDetails?.ramSize || "RAM"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Storage (SSD/HDD)</Label>
                  <Select
                    value={(form as any).storageId}
                    onValueChange={(v) =>
                      setForm((s) => ({ ...s, storageId: v }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("storage", (form as any).storageId).length
                            ? "Select available storage"
                            : "No available storage"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No Storage --</span>
                      </SelectItem>
                      {getAvailableForComponent("storage", (form as any).storageId).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available storage items
                        </div>
                      ) : (
                        getAvailableForComponent("storage", (form as any).storageId).map((s) => {
                          const storageDetails = getAssetById(s.id);

                          return (
                            <SelectItem key={s.id} value={s.id}>
                              {s.id} ({storageDetails?.storageType || "Storage"}{" "}
                              - {storageDetails?.storageCapacity || "Unknown"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">RAM (Slot 2)</Label>
                  <Select
                    value={form.ramId2}
                    onValueChange={(v) => setForm((s) => ({ ...s, ramId2: v }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          getAvailableForComponent("ram", form.ramId2).length
                            ? "Select available RAM"
                            : "No available RAM"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      <SelectItem value="none">
                        <span className="text-slate-400">-- No RAM --</span>
                      </SelectItem>
                      {getAvailableForComponent("ram", form.ramId2).length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No available RAM items
                        </div>
                      ) : (
                        getAvailableForComponent("ram", form.ramId2).map((m) => {
                          const ramDetails = getAssetById(m.id);

                          return (
                            <SelectItem key={m.id} value={m.id}>
                              {m.id} ({ramDetails?.ramSize || "RAM"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {editingItem ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Saved Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-slate-300">No records</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>System Type</TableHead>
                      <TableHead>Total RAM</TableHead>
                      <TableHead>Mouse ID</TableHead>
                      <TableHead>Keyboard ID</TableHead>
                      <TableHead>Motherboard ID</TableHead>
                      <TableHead>Camera ID</TableHead>
                      <TableHead>Headphone ID</TableHead>
                      <TableHead>Power Supply ID</TableHead>
                      <TableHead>Storage ID</TableHead>
                      <TableHead>RAM Slot 1</TableHead>
                      <TableHead>RAM Slot 2</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.id}</TableCell>
                        <TableCell>{a.systemType || "-"}</TableCell>
                        <TableCell>{a.totalRam || "-"}</TableCell>
                        <TableCell>{a.mouseId || "-"}</TableCell>
                        <TableCell>{a.keyboardId || "-"}</TableCell>
                        <TableCell>{a.motherboardId || "-"}</TableCell>
                        <TableCell>{a.cameraId || "-"}</TableCell>
                        <TableCell>{a.headphoneId || "-"}</TableCell>
                        <TableCell>{a.powerSupplyId || "-"}</TableCell>
                        <TableCell>
                          {(() => {
                            const storageId = (a as any).storageId;
                            if (!storageId) return "-";

                            const storageDetails = getAssetById(storageId);

                            return storageDetails
                              ? `${storageId} (${storageDetails.storageType || "Storage"} - ${storageDetails.storageCapacity || "Unknown"})`
                              : storageId;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const ramId = a.ramId;
                            if (!ramId) return "-";

                            const ramDetails = getAssetById(ramId);

                            return ramDetails
                              ? `${ramId} (${ramDetails.ramSize || "RAM"})`
                              : ramId;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const ramId2 = (a as any).ramId2;
                            if (!ramId2) return "-";

                            const ramDetails = getAssetById(ramId2);

                            return ramDetails
                              ? `${ramId2} (${ramDetails.ramSize || "RAM"})`
                              : ramId2;
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            // Calculate total RAM from both slots
                            let total = 0;

                            // Get RAM 1 size
                            if (a.ramId) {
                              const ram1Details = getAssetById(a.ramId);
                              if (ram1Details?.ramSize) {
                                const size1 =
                                  parseInt(
                                    ram1Details.ramSize.replace(/[^0-9]/g, ""),
                                  ) || 0;
                                total += size1;
                              }
                            }

                            // Get RAM 2 size
                            if ((a as any).ramId2) {
                              const ram2Details = getAssetById(
                                (a as any).ramId2,
                              );
                              if (ram2Details?.ramSize) {
                                const size2 =
                                  parseInt(
                                    ram2Details.ramSize.replace(/[^0-9]/g, ""),
                                  ) || 0;
                                total += size2;
                              }
                            }

                            return total > 0 ? `${total}GB` : "-";
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openForm(a)}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteItem(a)}
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
