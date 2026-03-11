import AppNav from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mouse,
  Keyboard,
  Cpu,
  HardDrive,
  PlugZap,
  Headphones,
  Camera,
  Monitor,
  Phone,
  Trash2,
  Edit,
  type LucideIcon,
} from "lucide-react";
import {
  STORAGE_KEY,
  nextWxId,
  canonical,
  type Asset,
} from "@/lib/systemAssets";

const registry: Record<
  string,
  { title: string; Icon: LucideIcon; color: string; bg: string }
> = {
  mouse: {
    title: "Mouse",
    Icon: Mouse,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  keyboard: {
    title: "Keyboard",
    Icon: Keyboard,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  motherboard: {
    title: "Motherboard",
    Icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  ram: {
    title: "RAM",
    Icon: HardDrive,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  "power-supply": {
    title: "Power Supply",
    Icon: PlugZap,
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
  headphone: {
    title: "Headphone",
    Icon: Headphones,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
  camera: {
    title: "Camera",
    Icon: Camera,
    color: "text-pink-400",
    bg: "bg-pink-500/20",
  },
  monitor: {
    title: "Monitor",
    Icon: Monitor,
    color: "text-teal-400",
    bg: "bg-teal-500/20",
  },
  storage: {
    title: "SSD/HDD",
    Icon: HardDrive,
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  vonage: {
    title: "Vonage",
    Icon: Phone,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
  },
  "vitel-vital": {
    title: "Vitel Global",
    Icon: Phone,
    color: "text-orange-400",
    bg: "bg-orange-500/20",
  },
  // Alternate spellings
  moush: {
    title: "Mouse",
    Icon: Mouse,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  keybord: {
    title: "Keyboard",
    Icon: Keyboard,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  motherbord: {
    title: "Motherboard",
    Icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  rem: {
    title: "RAM",
    Icon: HardDrive,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  hadphone: {
    title: "Headphone",
    Icon: Headphones,
    color: "text-cyan-400",
    bg: "bg-cyan-500/20",
  },
  moniter: {
    title: "Monitor",
    Icon: Monitor,
    color: "text-teal-400",
    bg: "bg-teal-500/20",
  },
};

export default function SystemInfoDetail() {
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const key = (slug || "").toLowerCase();
  const data = registry[key];
  const categoryKey = canonical[key] || key;
  const isVonage = categoryKey === "vonage";
  const isVitelVital = categoryKey === "vitel-vital";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    serialNumber: "",
    vendorName: "",
    companyName: "",
    purchaseDate: "",
    warrantyEndDate: "",
    modal: "",
    vonageNumber: "",
    vonageExtCode: "",
    vonagePassword: "",
    vitelGlobalNumber: "",
    vitelExt: "",
    vitelUsername: "",
    vitelPassword: "",
    ramSize: "",
    ramType: "",
    processorModel: "",
    storageType: "",
    storageCapacity: "",
    quantity: "1",
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch("/api/system-assets");
        const result = await response.json();
        if (result.success) {
          setAssets(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch assets:", error);
        setAssets([]);
      }
    };

    fetchAssets();
  }, []);

  const filtered = useMemo(
    () => assets.filter((a) => a.category === categoryKey),
    [assets, categoryKey],
  );

  const openForm = () => {
    const id = nextWxId(assets, categoryKey);
    setForm({
      id,
      serialNumber: "",
      vendorName: "",
      companyName: "",
      purchaseDate: "",
      warrantyEndDate: "",
      modal: "",
      vonageNumber: "",
      vonageExtCode: "",
      vonagePassword: "",
      vitelGlobalNumber: "",
      vitelExt: "",
      vitelUsername: "",
      vitelPassword: "",
      ramSize: "",
      ramType: "",
      processorModel: "",
      storageType: "",
      storageCapacity: "",
    });
    setShowForm(true);
  };

  const deleteAsset = (id: string) => {
    const password = prompt("Enter password to delete this item:");
    if (password === "1") {
      const updated = assets.filter((a) => a.id !== id);
      setAssets(updated);

      // Try to delete from API
      fetch(`/api/system-assets/${id}`, { method: "DELETE" }).catch(
        console.error,
      );
      alert("Item deleted successfully");
    } else if (password !== null) {
      alert("Incorrect password");
    }
  };

  const editAsset = (asset: Asset) => {
    setEditingId(asset.id);
    setForm({
      id: asset.id,
      serialNumber: asset.serialNumber || "",
      vendorName: asset.vendorName || "",
      companyName: asset.companyName || "",
      purchaseDate: asset.purchaseDate || "",
      warrantyEndDate: asset.warrantyEndDate || "",
      modal: asset.modal || "",
      vonageNumber: asset.vonageNumber || "",
      vonageExtCode: asset.vonageExtCode || "",
      vonagePassword: asset.vonagePassword || "",
      vitelGlobalNumber: (asset as any).vitelGlobalNumber || "",
      vitelExt: (asset as any).vitelExt || "",
      vitelUsername: (asset as any).vitelUsername || "",
      vitelPassword: (asset as any).vitelPassword || "",
      ramSize: (asset as any).ramSize || "",
      ramType: (asset as any).ramType || "",
      processorModel: (asset as any).processorModel || "",
      storageType: (asset as any).storageType || "",
      storageCapacity: (asset as any).storageCapacity || "",
      quantity: "1",
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVonage) {
      if (
        !form.companyName ||
        !form.vonageNumber ||
        !form.vonageExtCode ||
        !form.vonagePassword ||
        !form.purchaseDate ||
        !form.warrantyEndDate
      ) {
        alert("Fill all fields");
        return;
      }
    } else if (isVitelVital) {
      if (
        !form.vitelGlobalNumber ||
        !form.vitelExt ||
        !form.vitelUsername ||
        !form.vitelPassword
      ) {
        alert("Fill all fields");
        return;
      }
    } else {
      const serialRequired = categoryKey !== "ram"; // allow auto serials for RAM
      if (
        !form.companyName ||
        (serialRequired && !form.serialNumber) ||
        !form.vendorName ||
        !form.purchaseDate ||
        !form.warrantyEndDate
      ) {
        alert("Fill all fields");
        return;
      }
    }

    const record: Asset = {
      id: form.id || nextWxId(assets, categoryKey),
      category: categoryKey,
      serialNumber: isVitelVital ? "" : (form.serialNumber || "").trim(),
      vendorName: isVitelVital ? "" : form.vendorName.trim(),
      companyName: isVitelVital ? "" : form.companyName.trim(),
      purchaseDate: isVitelVital ? "" : form.purchaseDate,
      warrantyEndDate: isVitelVital ? "" : form.warrantyEndDate,
      createdAt: new Date().toISOString(),
      modal: form.modal?.trim(),
      vonageNumber: form.vonageNumber?.trim(),
      vonageExtCode: form.vonageExtCode?.trim(),
      vonagePassword: form.vonagePassword,
      vitelGlobalNumber: isVitelVital ? (form.vitelGlobalNumber || "").trim() : undefined,
      vitelExt: isVitelVital ? (form.vitelExt || "").trim() : undefined,
      vitelUsername: isVitelVital ? (form.vitelUsername || "").trim() : undefined,
      vitelPassword: isVitelVital ? form.vitelPassword : undefined,
      ramSize: categoryKey === "ram" ? (form.ramSize || "").trim() : undefined,
      ramType: categoryKey === "ram" ? (form.ramType || "").trim() : undefined,
      processorModel:
        categoryKey === "motherboard"
          ? (form.processorModel || "").trim()
          : undefined,
      storageType:
        categoryKey === "storage" ? (form.storageType || "").trim() : undefined,
      storageCapacity:
        categoryKey === "storage"
          ? (form.storageCapacity || "").trim()
          : undefined,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/system-assets/${editingId}`
        : "/api/system-assets";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      const result = await response.json();
      if (result.success) {
        if (editingId) {
          // Update existing
          const updated = assets.map((a) => (a.id === editingId ? record : a));
          setAssets(updated);
          setEditingId(null);
        } else {
          // Add new
          const next = [record, ...assets];
          setAssets(next);
        }
        setShowForm(false);
        alert("Saved");
      } else {
        alert("Error saving asset: " + result.error);
      }
    } catch (error) {
      console.error("Failed to save asset:", error);
      alert(
        "Error saving asset: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {data ? (
              <span
                className={`w-12 h-12 ${data.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <data.Icon className={`h-6 w-6 ${data.color}`} />
              </span>
            ) : null}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {data ? data.title : "Item"}
              </h1>
              <p className="text-slate-400 text-sm">Specifications and notes</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate(-1)}
              className="bg-slate-700 hover:bg-slate-600 text-white w-full sm:w-auto"
              title="Go back to previous page"
            >
              Back
            </Button>
            {data ? (
              <Button
                onClick={openForm}
                className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
              >
                Add System Info
              </Button>
            ) : null}
          </div>
        </header>

        {data && showForm && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">
                Add System Info: {data.title}
              </CardTitle>
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
                  <Label className="text-slate-300">Category</Label>
                  <Input
                    value={data.title}
                    readOnly
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                {isVonage ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Company Name</Label>
                      <Input
                        value={form.companyName || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            companyName: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Modal</Label>
                      <Input
                        value={form.modal || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            modal: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter modal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Vonage Number</Label>
                      <Input
                        value={form.vonageNumber || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vonageNumber: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Extension Code</Label>
                      <Input
                        value={form.vonageExtCode || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vonageExtCode: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter extension code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input
                        type="password"
                        value={form.vonagePassword || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vonagePassword: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Purchase Date</Label>
                      <Input
                        type="date"
                        value={form.purchaseDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            purchaseDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Warranty End Date
                      </Label>
                      <Input
                        type="date"
                        value={form.warrantyEndDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            warrantyEndDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  </>
                ) : isVitelVital ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Vitel Global Number</Label>
                      <Input
                        value={form.vitelGlobalNumber || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vitelGlobalNumber: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter Vitel global number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Ext</Label>
                      <Input
                        value={form.vitelExt || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vitelExt: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter extension"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Username</Label>
                      <Input
                        value={form.vitelUsername || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vitelUsername: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input
                        type="password"
                        value={form.vitelPassword || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            vitelPassword: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter password"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Company Name</Label>
                      <Input
                        value={form.companyName || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            companyName: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Serial Number</Label>
                      <Input
                        value={form.serialNumber || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            serialNumber: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter serial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Modal</Label>
                      <Input
                        value={form.modal || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            modal: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter modal"
                      />
                    </div>

                    {categoryKey === "ram" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-slate-300">RAM Size</Label>
                          <Select
                            value={form.ramSize}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, ramSize: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {[
                                "2GB",
                                "4GB",
                                "8GB",
                                "16GB",
                                "32GB",
                                "64GB",
                              ].map((sz) => (
                                <SelectItem key={sz} value={sz}>
                                  {sz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">RAM Type</Label>
                          <Select
                            value={form.ramType}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, ramType: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {["Desktop", "Laptop"].map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {categoryKey === "motherboard" && (
                      <div className="space-y-2">
                        <Label className="text-slate-300">Processor</Label>
                        <Select
                          value={form.processorModel}
                          onValueChange={(v) =>
                            setForm((s) => ({ ...s, processorModel: v }))
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select processor" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                            {["i3", "i5", "i6", "i7", "i9"].map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {categoryKey === "storage" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Storage Type</Label>
                          <Select
                            value={form.storageType}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, storageType: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {["SSD", "HDD", "NVMe"].map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Capacity</Label>
                          <Select
                            value={form.storageCapacity}
                            onValueChange={(v) =>
                              setForm((s) => ({ ...s, storageCapacity: v }))
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                              {[
                                "128GB",
                                "256GB",
                                "512GB",
                                "1TB",
                                "2TB",
                                "4TB",
                              ].map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label className="text-slate-300">Vendor Name</Label>
                      <Input
                        value={form.vendorName || ""}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, vendorName: e.target.value }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Enter vendor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Purchase Date</Label>
                      <Input
                        type="date"
                        value={form.purchaseDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            purchaseDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Warranty End Date
                      </Label>
                      <Input
                        type="date"
                        value={form.warrantyEndDate || ""}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            warrantyEndDate: e.target.value,
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  </>
                )}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-slate-300">No records</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    {isVonage ? (
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Modal</TableHead>
                        <TableHead>Number</TableHead>
                        <TableHead>Ext Code</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty End Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    ) : isVitelVital ? (
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Vitel Global Number</TableHead>
                        <TableHead>Ext</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Modal</TableHead>
                        {categoryKey === "ram" && (
                          <TableHead>RAM Size</TableHead>
                        )}
                        {categoryKey === "ram" && (
                          <TableHead>RAM Type</TableHead>
                        )}
                        {categoryKey === "motherboard" && (
                          <TableHead>Processor</TableHead>
                        )}
                        {categoryKey === "storage" && (
                          <TableHead>Type</TableHead>
                        )}
                        {categoryKey === "storage" && (
                          <TableHead>Capacity</TableHead>
                        )}
                        <TableHead>Vendor</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Warranty End Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) =>
                      isVonage ? (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.id}</TableCell>
                          <TableCell>{a.companyName}</TableCell>
                          <TableCell>{a.modal || "-"}</TableCell>
                          <TableCell>{a.vonageNumber}</TableCell>
                          <TableCell>{a.vonageExtCode}</TableCell>
                          <TableCell>{a.vonagePassword}</TableCell>
                          <TableCell>{a.purchaseDate}</TableCell>
                          <TableCell>{a.warrantyEndDate}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => editAsset(a)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteAsset(a.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : isVitelVital ? (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.id}</TableCell>
                          <TableCell>{(a as any).vitelGlobalNumber}</TableCell>
                          <TableCell>{(a as any).vitelExt}</TableCell>
                          <TableCell>{(a as any).vitelUsername}</TableCell>
                          <TableCell>{(a as any).vitelPassword}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => editAsset(a)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteAsset(a.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.id}</TableCell>
                          <TableCell>{a.companyName}</TableCell>
                          <TableCell>{a.serialNumber}</TableCell>
                          <TableCell>{a.modal || "-"}</TableCell>
                          {categoryKey === "ram" && (
                            <TableCell>{(a as any).ramSize || "-"}</TableCell>
                          )}
                          {categoryKey === "ram" && (
                            <TableCell>{(a as any).ramType || "-"}</TableCell>
                          )}
                          {categoryKey === "motherboard" && (
                            <TableCell>
                              {(a as any).processorModel || "-"}
                            </TableCell>
                          )}
                          {categoryKey === "storage" && (
                            <TableCell>
                              {(a as any).storageType || "-"}
                            </TableCell>
                          )}
                          {categoryKey === "storage" && (
                            <TableCell>
                              {(a as any).storageCapacity || "-"}
                            </TableCell>
                          )}
                          <TableCell>{a.vendorName}</TableCell>
                          <TableCell>{a.purchaseDate}</TableCell>
                          <TableCell>{a.warrantyEndDate}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-500/10"
                              onClick={() => editAsset(a)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteAsset(a.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {categoryKey && (
              <Badge
                className="bg-slate-700 text-slate-300"
                variant="secondary"
              >
                {categoryKey}
              </Badge>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
