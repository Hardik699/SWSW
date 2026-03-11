import AppNav from "@/components/Navigation";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Trash2,
  Save,
  Shield,
  ServerCog,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface Employee {
  id: string;
  fullName: string;
  department: string;
  tableNumber: string;
  email: string;
  status: "active" | "inactive";
}

interface Department {
  id: string;
  name: string;
}

type EmailCred = {
  provider: string;
  providerCustom?: string;
  email: string;
  password: string;
};

interface ITRecord {
  id: string;
  _id?: string; // MongoDB ID for existing records
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: EmailCred[];
  vitelGlobal: {
    id: string;
    provider: "vitel" | "vonage";
  };
  lmPlayer: { id: string; password: string; license: string };
  notes?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export default function ITPage() {
  // --- HOOKS ---
  const navigate = useNavigate();

  // --- STATE DECLARATIONS ---
  const [userRole, setUserRole] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [records, setRecords] = useState<ITRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [employeeId, setEmployeeId] = useState<string>("");
  const [systemId, setSystemId] = useState("");
  const [preSelectedSystemId, setPreSelectedSystemId] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [emails, setEmails] = useState<EmailCred[]>([
    { provider: "CUSTOM", providerCustom: "", email: "", password: "" },
  ]);
  const [provider, setProvider] = useState<"vitel" | "vonage">("vitel");
  const [vitel, setVitel] = useState({ id: "" });
  const [lm, setLm] = useState({ id: "", password: "", license: "standard" });
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [secretsVisible, setSecretsVisible] = useState(false);
  const [availableSystemIds, setAvailableSystemIds] = useState<string[]>([]);
  const [providerIds, setProviderIds] = useState<string[]>([]);
  const [pcPreview, setPcPreview] = useState<any | null>(null);
  const [providerPreview, setProviderPreview] = useState<any | null>(null);
  const [preSelectedProviderId, setPreSelectedProviderId] =
    useState<string>("");
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [systemAssets, setSystemAssets] = useState<any[]>([]);
  const [pcLaptops, setPcLaptops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- MEMOIZED VALUES ---
  const employee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId],
  );

  const availableEmployees = useMemo(() => {
    // Only filter out ACTIVE users - inactive users can be assigned again
    const activeAssignedIds = new Set(
      records
        .filter((r) => r.status === "active")
        .map((r) => r.employeeId)
    );
    return employees.filter(
      (e) => !activeAssignedIds.has(e.id) || e.id === employeeId,
    );
  }, [employees, records, employeeId]);

  const availableTables = useMemo(
    () => Array.from({ length: 32 }, (_, i) => String(i + 1)),
    [],
  );

  const usedTables = useMemo(() => {
    return new Set(
      employees
        .filter((e) => e.status === "active" && e.tableNumber)
        .map((e) => String(e.tableNumber)),
    );
  }, [employees]);

  const filteredTables = useMemo(() => {
    const keep = String(employee?.tableNumber || "");
    return availableTables.filter(
      (n) => (keep && n === keep) || !usedTables.has(n),
    );
  }, [availableTables, usedTables, employee]);

  const hasAssignedTable = useMemo(
    () =>
      !!(
        (employee?.tableNumber && String(employee.tableNumber).trim()) ||
        (tableNumber && String(tableNumber).trim())
      ),
    [employee, tableNumber],
  );

  // --- HELPER FUNCTIONS ---

  // Load and filter available PC/Laptop IDs from database
  const loadAvailableSystemIds = async (currentRecords?: ITRecord[]) => {
    try {
      const response = await fetch("/api/pc-laptop");
      const result = await response.json();

      if (result.success && result.data) {
        const pcLaptops = result.data;
        const pcLaptopIds = pcLaptops.map((item: any) => item.id);

        // Get system IDs assigned to ACTIVE users only
        // If a user is inactive, their system ID becomes available for reuse
        const recordsToFilter = currentRecords !== undefined ? currentRecords : records;
        const activeAssignedIds = recordsToFilter
          .filter((record) => record.status === "active")
          .map((record) => record.systemId);

        // Filter out assigned IDs of active users to show only available ones
        let available = pcLaptopIds.filter(
          (id: string) => !activeAssignedIds.includes(id),
        );
        if (preSelectedSystemId && !available.includes(preSelectedSystemId)) {
          available = [preSelectedSystemId, ...available];
        }
        setAvailableSystemIds(available);
      } else {
        setAvailableSystemIds([]);
      }
    } catch (error) {
      console.error("Failed to load PC/Laptop IDs:", error);
      setAvailableSystemIds([]);
    }
  };

  const saveRecords = async (next: ITRecord[]) => {
    setRecords(next);
    const errors: string[] = [];

    try {
      for (const record of next) {
        // If record has _id, it's an existing record from the database
        if (record._id) {
          const response = await fetch(`/api/it-accounts/${record._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            errors.push(
              `Failed to update ${record.employeeName}: ${errData.error || response.statusText}`,
            );
          }
        } else {
          // New record - don't send _id or use id for creation
          const { _id, ...recordData } = record;
          const response = await fetch("/api/it-accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recordData),
          });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            errors.push(
              `Failed to create ${record.employeeName}: ${errData.error || response.statusText}`,
            );
          } else {
            // Update the record in state with the new _id from server if possible
            const result = await response.json();
            if (result.success && result.data && result.data._id) {
              setRecords((current) =>
                current.map((r) =>
                  r.id === record.id ? { ...r, _id: result.data._id } : r,
                ),
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to save IT accounts:", error);
      errors.push(error instanceof Error ? error.message : String(error));
    }

    if (errors.length > 0) {
      alert("Some errors occurred while saving:\n" + errors.join("\n"));
    }

    // Refresh available system IDs after saving (pass the updated records)
    await loadAvailableSystemIds(next);
    return errors.length === 0;
  };

  const addEmailRow = () =>
    setEmails((rows) => [
      ...rows,
      { provider: "CUSTOM", providerCustom: "", email: "", password: "" },
    ]);

  const requirePasscode = () => {
    const code = prompt("Enter passcode to view passwords");
    if (code === "1111") {
      setSecretsVisible(true);
    } else if (code !== null) {
      alert("Incorrect passcode");
    }
  };

  const removeEmailRow = (idx: number) =>
    setEmails((rows) => rows.filter((_, i) => i !== idx));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !systemId || !department || !tableNumber) {
      alert(
        "Please fill required fields (Employee, System ID, Department, Table)",
      );
      return;
    }
    const cleanEmails = emails.filter((r) => r.email.trim());

    const rec: ITRecord = {
      id: editingId || `${Date.now()}`,
      _id: editingId || undefined,
      employeeId,
      employeeName: employee?.fullName || "",
      systemId: systemId.trim(),
      tableNumber,
      department,
      emails: cleanEmails,
      vitelGlobal: { id: vitel.id.trim(), provider },
      lmPlayer: { ...lm },
      notes: notes.trim() || undefined,
      status,
      createdAt: new Date().toISOString(),
    };
    const success = await saveRecords(editingId ? [rec] : [rec, ...records]);

    if (success) {
      // reset minimal
      setEditingId(null);
      setSystemId("");
      setEmails([
        { provider: "CUSTOM", providerCustom: "", email: "", password: "" },
      ]);
      setProvider("vitel");
      setVitel({ id: "" });
      setLm({ id: "", password: "", license: "standard" });
      setNotes("");
      setStatus("active");
      alert(editingId ? "Updated Successfully" : "Saved Successfully");
      if (editingId) {
        window.location.href = "/it-dashboard";
      }
    }
  };

  // --- EFFECTS ---

  // Load local data
  useEffect(() => {
    const loadData = async () => {
      try {
        const requests = [
          fetch("/api/employees").catch((err) => {
            console.error("Failed to fetch employees:", err);
            return new Response(JSON.stringify({ success: false, data: [] }), {
              status: 500,
            });
          }),
          fetch("/api/departments").catch((err) => {
            console.error("Failed to fetch departments:", err);
            return new Response(JSON.stringify({ success: false, data: [] }), {
              status: 500,
            });
          }),
          fetch("/api/it-accounts").catch((err) => {
            console.error("Failed to fetch IT accounts:", err);
            return new Response(JSON.stringify({ success: false, data: [] }), {
              status: 500,
            });
          }),
        ];

        const [empRes, deptRes, itsRes] = await Promise.all(requests);

        if (empRes.ok) {
          try {
            const empData = await empRes.json();
            if (empData.success && empData.data) {
              // Map MongoDB _id to id for consistency
              const mappedEmployees = empData.data.map((emp: any) => ({
                ...emp,
                id: emp._id,
              }));
              setEmployees(mappedEmployees);
            }
          } catch (e) {
            console.error("Failed to parse employees response. This often happens if the connection is lost during body read or if the response is not valid JSON.", e);
          }
        }
        if (deptRes.ok) {
          try {
            const deptData = await deptRes.json();
            if (deptData.success && deptData.data) {
              // Map MongoDB _id to id for consistency
              const mappedDepts = deptData.data.map((dept: any) => ({
                ...dept,
                id: dept._id,
              }));
              setDepartments(mappedDepts);
            }
          } catch (e) {
            console.error("Failed to parse departments response:", e);
          }
        }
        if (itsRes.ok) {
          try {
            const itsData = await itsRes.json();
            if (itsData.success && itsData.data) {
              // Map MongoDB _id to id for consistency
              const mappedRecords = itsData.data.map((rec: any) => ({
                ...rec,
                id: rec._id, // Use _id as the primary id
                _id: rec._id, // Keep _id for database operations
              }));
              setRecords(mappedRecords);
              // Load available PC/Laptop IDs immediately with the fetched records
              await loadAvailableSystemIds(mappedRecords);
            }
          } catch (e) {
            console.error("Failed to parse IT accounts response:", e);
          }
        }
      } catch (error) {
        console.error("Failed to load IT data:", error);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Load system assets from database
  useEffect(() => {
    const loadSystemAssets = async () => {
      try {
        const response = await fetch("/api/system-assets");
        const result = await response.json();
        if (result.success && result.data) {
          setSystemAssets(result.data);
        }
      } catch (error) {
        console.error("Failed to load system assets:", error);
        setSystemAssets([]);
      }
    };

    loadSystemAssets();
  }, []);

  // Load PC/Laptop data from database
  useEffect(() => {
    const loadPcLaptops = async () => {
      try {
        const response = await fetch("/api/pc-laptop");
        const result = await response.json();
        if (result.success && result.data) {
          setPcLaptops(result.data);
        }
      } catch (error) {
        console.error("Failed to load PC/Laptop data:", error);
        setPcLaptops([]);
      }
    };

    loadPcLaptops();
  }, []);

  // Handle URL parameters (Prefill from HR notification only)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Only pre-fill from HR notification params
    const preEmployeeId = urlParams.get("employeeId") || "";
    const preDepartment = urlParams.get("department") || "";
    const preTableNumber = urlParams.get("tableNumber") || "";
    const preSystemId = urlParams.get("systemId") || "";
    const preProvider = urlParams.get("provider") || "";
    const preProviderId = urlParams.get("providerId") || "";
    const preLmId = urlParams.get("lmId") || "";
    const preLmPassword = urlParams.get("lmPassword") || "";
    const editId = urlParams.get("editId") || "";

    if (editId) {
      setEditingId(editId);
      fetch(`/api/it-accounts/${editId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data) {
            const r = result.data;
            setEmployeeId(r.employeeId);
            setSystemId(r.systemId);
            setPreSelectedSystemId(r.systemId);
            setTableNumber(r.tableNumber);
            setDepartment(r.department);
            setEmails(
              r.emails && r.emails.length
                ? r.emails
                : [
                    {
                      provider: "CUSTOM",
                      providerCustom: "",
                      email: "",
                      password: "",
                    },
                  ],
            );
            setProvider(r.vitelGlobal?.provider || "vitel");
            setVitel({ id: r.vitelGlobal?.id || "" });
            setPreSelectedProviderId(r.vitelGlobal?.id || "");
            setLm(r.lmPlayer || { id: "", password: "", license: "standard" });
            setNotes(r.notes || "");
            setStatus(r.status || "active");
            setIsPreFilled(true);
          }
        })
        .catch((err) => console.error("Error fetching record for edit:", err));
    }

    if (preEmployeeId) setEmployeeId(preEmployeeId);
    if (preDepartment) setDepartment(preDepartment);
    if (preTableNumber) setTableNumber(preTableNumber);

    if (preEmployeeId && employees.length > 0) {
      const foundEmployee = employees.find((emp) => emp.id === preEmployeeId);
      if (foundEmployee) {
        if (!preDepartment) setDepartment(foundEmployee.department || "");
        if (!preTableNumber && foundEmployee.tableNumber)
          setTableNumber(String(foundEmployee.tableNumber));
      }
    }

    if (preSystemId) {
      setSystemId(preSystemId);
      setPreSelectedSystemId(preSystemId);
    }

    if (preProvider === "vonage" || preProvider === "vitel") {
      setProvider(preProvider as any);
    } else if (preProviderId) {
      const isVonage = systemAssets.some(
        (a) =>
          a.category === "vonage" &&
          (a.vonageExtCode === preProviderId ||
            a.vonageNumber === preProviderId ||
            a.id === preProviderId),
      );
      setProvider(isVonage ? ("vonage" as any) : ("vitel" as any));
    }

    if (preProviderId) {
      setVitel({ id: preProviderId });
      setPreSelectedProviderId(preProviderId);
    }

    if (preLmId) setLm((s) => ({ ...s, id: preLmId }));
    if (preLmPassword) setLm((s) => ({ ...s, password: preLmPassword }));

    if (
      preEmployeeId ||
      preSystemId ||
      preProvider ||
      preProviderId ||
      preLmId ||
      preLmPassword
    ) {
      setIsPreFilled(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [employees, systemAssets]);

  useEffect(() => {
    // Only auto-fill from employee if NOT pre-filled from URL
    if (employee && !isPreFilled) {
      setDepartment(employee.department || "");
      if (employee.tableNumber) setTableNumber(String(employee.tableNumber));
    }
  }, [employee, isPreFilled]);

  // Load provider IDs from System assets (from database) with filtering for active users
  useEffect(() => {
    const vonageAssets = systemAssets.filter(
      (a) => a.category === "vonage"
    );
    const vitelAssets = systemAssets.filter(
      (a) => a.category === "vitel-vital"
    );
    console.log("Vonage assets:", vonageAssets);
    console.log("Vitel assets:", vitelAssets);

    console.log("Total systemAssets loaded:", systemAssets.length);
    console.log("All categories in systemAssets:", [...new Set(systemAssets.map(a => a.category))]);

    // Get IDs assigned to ACTIVE users for the current provider
    const activeAssignedProviderIds = records
      .filter((record) => record.status === "active")
      .map((record) => record.vitelGlobal?.id)
      .filter((id): id is string => !!id);

    let ids = systemAssets
      .filter((a) =>
        provider === "vonage"
          ? a.category === "vonage"
          : a.category === "vitel-vital",
      )
      .map((a) => {
        if (provider === "vonage") {
          // Prefer vonageExtCode, then vonageNumber, but always fallback to id
          // Trim and filter out empty values and "-"
          const extCode = (a.vonageExtCode || "").trim();
          const number = (a.vonageNumber || "").trim();
          const id = (a.id || "").trim();

          // Use extension code if valid, otherwise use number, otherwise use id
          const selected = (extCode && extCode !== "-") ? extCode :
                          (number && number !== "-") ? number : id;

          console.log(`Vonage asset ${a.id} - ExtCode: "${extCode}", Number: "${number}", Selected: "${selected}"`);
          return selected;
        } else {
          // For Vitel: prefer vitelExt, then vitelGlobalNumber, then id
          const ext = (a.vitelExt || "").trim();
          const number = (a.vitelGlobalNumber || "").trim();
          const id = (a.id || "").trim();

          // Use ext if valid, otherwise use number, otherwise use id
          const selected = (ext && ext !== "-") ? ext :
                          (number && number !== "-") ? number : id;

          console.log(`Vitel asset ${a.id} - Ext: "${ext}", Number: "${number}", Selected: "${selected}"`);
          return selected;
        }
      })
      .filter((x) => typeof x === "string" && x.trim() && x.trim() !== "-")
      // Filter out IDs assigned to ACTIVE users (available for inactive users or new assignments)
      .filter((id) => !activeAssignedProviderIds.includes(id));

    console.log(`Provider IDs for ${provider}:`, ids);
    console.log(`Filtered count for ${provider}:`, ids.length);
    if (preSelectedProviderId && !ids.includes(preSelectedProviderId)) {
      ids = [preSelectedProviderId, ...ids];
    }
    setProviderIds(ids);
    setVitel((s) => ({
      id: ids.includes(s.id) ? s.id : preSelectedProviderId || "",
    }));
  }, [provider, preSelectedProviderId, systemAssets, records]);

  // Ensure the pre-selected System ID is present in options after URL parsing
  useEffect(() => {
    loadAvailableSystemIds(records);
  }, [preSelectedSystemId, records]);

  // Auto-load PC/Laptop details when System ID changes
  useEffect(() => {
    if (!systemId) {
      setPcPreview(null);
      return;
    }
    const found = pcLaptops.find((x) => x.id === systemId) || null;
    setPcPreview(found);
  }, [systemId, pcLaptops]);

  // Auto-load provider details when provider ID changes
  useEffect(() => {
    if (!vitel.id) {
      setProviderPreview(null);
      return;
    }
    if (provider === "vonage") {
      // Match using the same logic as the ID selection: prefer ext code, then number, then id
      const match = systemAssets.find((a) => {
        if (a.category !== "vonage") return false;

        const extCode = (a.vonageExtCode || "").trim();
        const number = (a.vonageNumber || "").trim();
        const id = (a.id || "").trim();

        const selected = (extCode && extCode !== "-") ? extCode :
                        (number && number !== "-") ? number : id;

        return selected === vitel.id;
      });
      setProviderPreview(match || null);
    } else {
      // Match using the same logic as the ID selection: prefer ext, then number, then id
      const match = systemAssets.find((a) => {
        if (!(a.category === "vitel" || a.category === "vitel-global" || a.category === "vitel-vital")) return false;

        const ext = (a.vitelExt || "").trim();
        const number = (a.vitelGlobalNumber || "").trim();
        const id = (a.id || "").trim();

        const selected = (ext && ext !== "-") ? ext :
                        (number && number !== "-") ? number : id;

        return selected === vitel.id;
      });
      setProviderPreview(match || null);
    }
  }, [provider, vitel.id, systemAssets]);

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white mb-4"
          onClick={() => navigate(-1)}
          title="Go back to previous page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <ServerCog className="h-7 w-7 text-blue-400 flex-shrink-0" /> IT
              Management
            </h1>
            <p className="text-slate-400">
              Create and store system credentials
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-slate-700 text-slate-300 w-full sm:w-auto text-center sm:text-left"
          >
            Role: {userRole || "guest"}
          </Badge>
        </header>

        {isPreFilled && (
          <Card className="bg-blue-900/30 border-blue-500/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-100 font-medium">
                    Form Pre-filled from HR Notification
                  </p>
                  <p className="text-blue-300 text-sm">
                    Employee Name, Department, and Table Number have been
                    automatically loaded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? "Edit IT Credentials" : "Add IT Credentials"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={submit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="space-y-2">
                <Label className="text-slate-300">Employee Name</Label>
                {isPreFilled && employeeId ? (
                  <>
                    <Input
                      value={employee?.fullName || ""}
                      disabled
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <input type="hidden" value={employeeId} />
                  </>
                ) : (
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {availableEmployees.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          No employees available (all have IT accounts)
                        </div>
                      ) : (
                        availableEmployees.map((e) => (
                          <SelectItem key={`employee-${e.id}`} value={e.id}>
                            {e.fullName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">System ID</Label>
                    <Badge
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {availableSystemIds.length} available
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    onClick={() => loadAvailableSystemIds(records)}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
                    title="Refresh available IDs"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <Select value={systemId} onValueChange={setSystemId}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue
                      placeholder={
                        availableSystemIds.length
                          ? "Select available PC/Laptop ID"
                          : "No PC/Laptop IDs available"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                    {availableSystemIds.length === 0 ? (
                      <div className="px-3 py-2 text-slate-400">
                        No available PC/Laptop IDs. Create some in PC/Laptop
                        Info first.
                      </div>
                    ) : (
                      availableSystemIds.map((id) => (
                        <SelectItem key={`system-${id}`} value={id}>
                          {id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {pcPreview && (
                  <div className="mt-2 p-3 rounded border border-slate-700 bg-slate-800/30 text-slate-300 text-sm">
                    <div className="font-medium text-white mb-1">
                      PC/Laptop Preview: {pcPreview.id}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>Mouse: {pcPreview.mouseId || "-"}</div>
                      <div>Keyboard: {pcPreview.keyboardId || "-"}</div>
                      <div>Motherboard: {pcPreview.motherboardId || "-"}</div>
                      <div>Camera: {pcPreview.cameraId || "-"}</div>
                      <div>Headphone: {pcPreview.headphoneId || "-"}</div>
                      <div>Power Supply: {pcPreview.powerSupplyId || "-"}</div>
                      <div>RAM: {pcPreview.ramId || "-"}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Department</Label>
                {isPreFilled ? (
                  <Input
                    value={department}
                    disabled
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                ) : (
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {departments.map((d) => (
                        <SelectItem key={`dept-${d.id}`} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {!hasAssignedTable && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Table Number</Label>
                  <Select value={tableNumber} onValueChange={setTableNumber}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select table (1-32)" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {filteredTables.map((n) => (
                        <SelectItem key={`table-${n}`} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Emails */}
              <div className="md:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Emails and Passwords</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                      onClick={() =>
                        secretsVisible
                          ? setSecretsVisible(false)
                          : requirePasscode()
                      }
                    >
                      {secretsVisible ? "Hide Passwords" : "Show Passwords"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                      onClick={addEmailRow}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Email
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {emails.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
                    >
                      <div className="space-y-2">
                        <Select
                          value={row.provider}
                          onValueChange={(v) =>
                            setEmails((r) =>
                              r.map((x, i) =>
                                i === idx ? { ...x, provider: v } : x,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                            {[
                              "WX",
                              "NSIT",
                              "LP",
                              "MS TEMS",
                              "OORWIN",
                              "MOSTER",
                              "CUSTOM",
                            ].map((opt) => (
                              <SelectItem key={`email-${idx}-${opt}`} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.provider === "CUSTOM" && (
                          <Input
                            placeholder="Custom provider"
                            value={row.providerCustom || ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setEmails((r) =>
                                r.map((x, i) =>
                                  i === idx ? { ...x, providerCustom: v } : x,
                                ),
                              );
                            }}
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        )}
                      </div>
                      <Input
                        placeholder="email@example.com"
                        value={row.email}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEmails((r) =>
                            r.map((x, i) =>
                              i === idx ? { ...x, email: v } : x,
                            ),
                          );
                        }}
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                      <Input
                        placeholder="password"
                        value={row.password}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEmails((r) =>
                            r.map((x, i) =>
                              i === idx ? { ...x, password: v } : x,
                            ),
                          );
                        }}
                        className="bg-slate-800/50 border-slate-700 text-white"
                        type={secretsVisible ? "text" : "password"}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400"
                          onClick={() => removeEmailRow(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telephony Provider */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">VG/VON</Label>
                  <Select
                    value={provider}
                    onValueChange={(v) => setProvider(v as any)}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem key="provider-vitel" value="vitel">Vitel Global</SelectItem>
                      <SelectItem key="provider-vonage" value="vonage">Vonage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-300">
                    {provider === "vonage" ? "Vonage ID" : "Vitel Global ID"}
                  </Label>
                  <Select
                    value={vitel.id}
                    onValueChange={(v) => setVitel({ id: v })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      {vitel.id ? (
                        <span>{vitel.id}</span>
                      ) : (
                        <SelectValue
                          placeholder={
                            providerIds.length
                              ? "Select ID"
                              : "No IDs found in System Info"
                          }
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                      {providerIds.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400">
                          Add{" "}
                          {provider === "vonage" ? "Vonage" : "Vitel Global"}{" "}
                          IDs in System Info
                        </div>
                      ) : (
                        providerIds.map((id) => (
                          <SelectItem key={`provider-id-${id}`} value={id}>
                            {id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {providerPreview && (
                    <div className="mt-2 p-3 rounded border border-slate-700 bg-slate-800/30 text-slate-300 text-sm">
                      <div className="font-medium text-white mb-1">
                        {provider === "vonage" ? "Vonage" : "Vitel Global"}{" "}
                        Preview
                      </div>
                      {provider === "vonage" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div>
                            Ext: {providerPreview?.vonageExtCode || "-"}
                          </div>
                          <div>
                            Number: {providerPreview?.vonageNumber || "-"}
                          </div>
                          <div>
                            Password:{" "}
                            {providerPreview?.vonagePassword
                              ? secretsVisible
                                ? providerPreview.vonagePassword
                                : "••••••"
                              : "-"}
                          </div>
                          <div>ID: {providerPreview?.id || "-"}</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div>ID: {providerPreview?.id || "-"}</div>
                          <div>Ext: {providerPreview?.vitelExt || "-"}</div>
                          <div>Number: {providerPreview?.vitelGlobalNumber || "-"}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* LM Player */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">LM ID</Label>
                  <Input
                    value={lm.id}
                    onChange={(e) =>
                      setLm((s) => ({ ...s, id: e.target.value }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Lm password</Label>
                  <Input
                    type={secretsVisible ? "text" : "password"}
                    value={lm.password}
                    onChange={(e) =>
                      setLm((s) => ({ ...s, password: e.target.value }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label className="text-slate-300">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  placeholder="Optional notes"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 flex justify-end gap-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    onClick={() => {
                      setEditingId(null);
                      setEmployeeId("");
                      setSystemId("");
                      setEmails([
                        {
                          provider: "CUSTOM",
                          providerCustom: "",
                          email: "",
                          password: "",
                        },
                      ]);
                      setVitel({ id: "" });
                      setLm({
                        id: "",
                        password: "",
                        license: "standard",
                      });
                      setNotes("");
                      setStatus("active");
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />{" "}
                  {editingId ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Saved IT Records</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-slate-400">No IT records yet</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>System ID</TableHead>
                      <TableHead>Dept</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Emails</TableHead>
                      <TableHead>VG/VON</TableHead>
                      <TableHead>LM ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.employeeName}
                        </TableCell>
                        <TableCell>{r.systemId}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.tableNumber}</TableCell>
                        <TableCell>
                          {r.emails.map((e) => e.email).join(", ")}
                        </TableCell>
                        <TableCell>
                          {r.vitelGlobal?.id
                            ? `${(r as any).vitelGlobal?.provider === "vonage" ? "Vonage" : (r as any).vitelGlobal?.provider ? "Vitel Global" : (r as any).vitelGlobal?.type || "Vitel Global"}: ${r.vitelGlobal.id}`
                            : "-"}
                        </TableCell>
                        <TableCell>{r.lmPlayer.id || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={r.status === "active" ? "default" : "secondary"}
                            className={
                              r.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }
                          >
                            {r.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-400"
                              onClick={() => {
                                setEditingId(r._id || r.id);
                                setEmployeeId(r.employeeId);
                                setSystemId(r.systemId);
                                setPreSelectedSystemId(r.systemId);
                                setTableNumber(r.tableNumber);
                                setDepartment(r.department);
                                setEmails(r.emails);
                                setProvider(r.vitelGlobal.provider);
                                setVitel({ id: r.vitelGlobal.id });
                                setLm(r.lmPlayer);
                                setNotes(r.notes || "");
                                setStatus(r.status);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                r.status === "active"
                                  ? "border-orange-600 text-orange-400"
                                  : "border-green-600 text-green-400"
                              }
                              onClick={() => {
                                const updated = {
                                  ...r,
                                  status: r.status === "active" ? "inactive" : "active",
                                };
                                saveRecords(
                                  records.map((x) =>
                                    x.id === r.id ? updated : x
                                  )
                                );
                              }}
                            >
                              {r.status === "active" ? "Mark Inactive" : "Mark Active"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400"
                              onClick={() => {
                                const filtered = records.filter((x) => x.id !== r.id);
                                saveRecords(filtered);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
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
