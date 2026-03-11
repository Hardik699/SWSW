import AppNav from "@/components/Navigation";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ServerCog,
  User,
  Building2,
  Plus,
  ArrowRight,
  CheckCircle,
  Bell,
  Settings,
  Eye,
  AlertCircle,
  X,
  RefreshCw,
  ArrowLeft,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  getPendingNotifications,
  markAsProcessed,
  deleteNotification,
} from "@/lib/notifications";

interface ITRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: { email: string; password: string }[];
  vitelGlobal: {
    id?: string;
    provider?: "vitel" | "vonage";
    type?: string;
    extNumber?: string;
    password?: string;
  };
  lmPlayer: { id: string; password: string; license: string };
  notes?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface Employee {
  id: string;
  fullName: string;
  department: string;
  status: "active" | "inactive";
}
interface Department {
  id: string;
  name: string;
}

interface PendingITNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  tableNumber: string;
  email: string;
  createdAt: string;
  processed: boolean;
}

export default function ITDashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ITRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingNotifications, setPendingNotifications] = useState<
    PendingITNotification[]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load IT records from database
  const loadITRecords = async (showError = true) => {
    try {
      const response = await fetch("/api/it-accounts");
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch IT accounts");
      }
      const itsData = await response.json();
      if (itsData.success && itsData.data) {
        // Map MongoDB _id to id for consistency
        const mappedRecords = itsData.data.map((rec: any) => ({
          ...rec,
          id: rec._id,
        }));
        setRecords(mappedRecords);
        setLastError(null);
        setLastUpdated(new Date());
      }
    } catch (error) {
      if (showError) {
        console.error("Failed to load IT records:", error);
      }
      // Only set last error if it's a persistent issue
      if (error instanceof Error && error.message.includes("fetch")) {
        setLastError("Network error: Server might be restarting...");
      } else {
        setLastError(
          error instanceof Error ? error.message : "Failed to load IT records",
        );
      }
    }
  };

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadITRecords(false),
        (async () => {
          const res = await fetch("/api/departments");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setDepartments(
                data.data.map((dept: any) => ({ ...dept, id: dept._id })),
              );
            }
          }
        })(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportToExcel = () => {
    if (records.length === 0) {
      alert("No IT records to export");
      return;
    }

    // Prepare data for export with ALL information
    const exportData = records.map((r) => {
      // Format all emails with passwords
      const emailDetails = r.emails.map((e, idx) => {
        const provider = e.provider === "CUSTOM" ? e.providerCustom : e.provider;
        return `${idx + 1}. ${provider}: ${e.email} | Password: ${e.password || "-"}`;
      }).join(" | ");

      return {
        "Employee ID": r.employeeId,
        "Employee Name": r.employeeName,
        "Department": r.department,
        "Table Number": r.tableNumber,
        "Status": r.status === "active" ? "Active" : "Inactive",
        "System ID": r.systemId,
        "Email Accounts": emailDetails || "-",
        "Email 1": r.emails[0]?.email || "-",
        "Email 1 Password": r.emails[0]?.password || "-",
        "Email 2": r.emails[1]?.email || "-",
        "Email 2 Password": r.emails[1]?.password || "-",
        "Email 3": r.emails[2]?.email || "-",
        "Email 3 Password": r.emails[2]?.password || "-",
        "VG/VON Provider": (r as any).vitelGlobal?.provider === "vonage" ? "Vonage" : "Vitel Global",
        "VG/VON ID": r.vitelGlobal?.id || "-",
        "LM ID": r.lmPlayer.id || "-",
        "LM Password": r.lmPlayer.password || "-",
        "LM License": r.lmPlayer.license || "Standard",
        "Notes": r.notes || "-",
        "Created Date": new Date(r.createdAt).toLocaleDateString(),
        "Created Time": new Date(r.createdAt).toLocaleTimeString(),
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for all columns
    const columnWidths = [
      { wch: 12 }, // Employee ID
      { wch: 20 }, // Employee Name
      { wch: 15 }, // Department
      { wch: 12 }, // Table Number
      { wch: 10 }, // Status
      { wch: 12 }, // System ID
      { wch: 45 }, // Email Accounts (combined)
      { wch: 25 }, // Email 1
      { wch: 20 }, // Email 1 Password
      { wch: 25 }, // Email 2
      { wch: 20 }, // Email 2 Password
      { wch: 25 }, // Email 3
      { wch: 20 }, // Email 3 Password
      { wch: 15 }, // VG/VON Provider
      { wch: 15 }, // VG/VON ID
      { wch: 12 }, // LM ID
      { wch: 20 }, // LM Password
      { wch: 12 }, // LM License
      { wch: 30 }, // Notes
      { wch: 12 }, // Created Date
      { wch: 12 }, // Created Time
    ];
    worksheet["!cols"] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IT Accounts");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `IT_Accounts_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
  };

  useEffect(() => {
    // Check access control
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Only admin and it users can access IT dashboard
    if (userRole !== "admin" && userRole !== "it") {
      navigate("/");
      return;
    }

    loadAllData();

    // Load pending notifications for new employees
    const pending = getPendingNotifications();
    setPendingNotifications(pending as any);

    // Polling mechanism - check for new IT records and notifications every 10 seconds (increased from 5s)
    const refreshInterval = setInterval(() => {
      // Don't poll if the page is hidden to save resources and avoid noise
      if (!document.hidden) {
        loadITRecords(false);
        const freshPending = getPendingNotifications();
        setPendingNotifications(freshPending as any);
      }
    }, 10000);

    // Also reload when page becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadITRecords(false);
        const freshPending = getPendingNotifications();
        setPendingNotifications(freshPending as any);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  // Remove the separate useEffects for assets and pc-laptops as they are now in loadAllData

  const handleProcessEmployee = (notification: PendingITNotification) => {
    // Do NOT mark processed here. Keep notification until IT record is created.
    const urlParams = new URLSearchParams({
      employeeId: notification.employeeId,
      employeeName: notification.employeeName,
      department: notification.department,
      tableNumber: notification.tableNumber,
    });
    window.location.href = `/it?${urlParams.toString()}`;
  };

  const filtered = records.filter((r) => {
    const matchDept = deptFilter === "all" || r.department === deptFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const providerLabel =
      (r as any).vitelGlobal?.provider === "vonage"
        ? "vonage"
        : (r as any).vitelGlobal?.provider
          ? "vitel"
          : "vitel";
    const text =
      `${r.employeeName} ${r.systemId} ${r.emails.map((e) => e.email).join(" ")} ${r.vitelGlobal?.id || ""} ${providerLabel}`.toLowerCase();
    const matchQuery = !query || text.includes(query.toLowerCase());
    return matchDept && matchStatus && matchQuery;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            <ServerCog className="h-7 w-7 text-blue-400 flex-shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                IT Dashboard
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Overview of IT accounts and systems
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            {lastError && (
              <Badge
                variant="outline"
                className="border-red-500/50 text-red-400 bg-red-500/10 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" /> {lastError}
              </Badge>
            )}
            {lastUpdated && !lastError && (
              <span className="text-slate-500 text-xs hidden sm:inline">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
              onClick={exportToExcel}
              title="Download IT accounts information as Excel file"
            >
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
              onClick={loadAllData}
              disabled={isRefreshing}
              title="Refresh IT records and notifications"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 relative"
                >
                  <Bell className="h-4 w-4" />
                  {pendingNotifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      {pendingNotifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-slate-800 border-slate-700 text-white w-80"
                align="end"
              >
                {pendingNotifications.length === 0 ? (
                  <DropdownMenuItem className="focus:bg-slate-700 cursor-default">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle className="h-4 w-4" />
                      No pending IT setups
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <div className="px-3 py-2 text-sm font-semibold text-slate-300 border-b border-slate-700">
                      Pending IT Setups ({pendingNotifications.length})
                    </div>
                    {pendingNotifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="focus:bg-slate-700 cursor-pointer p-3"
                        onClick={() => handleProcessEmployee(notification)}
                      >
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">
                              {notification.employeeName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-orange-500/20 text-orange-400 text-xs"
                            >
                              New
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400">
                            {notification.department} •{" "}
                            {isNaN(Number(notification.tableNumber))
                              ? notification.tableNumber
                              : `Table ${notification.tableNumber}`}
                          </div>
                          <div className="text-xs text-slate-500">
                            Created{" "}
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString()}
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white mt-2 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcessEmployee(notification);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Process IT Setup
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => (window.location.href = "/it")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Add Credentials <Plus className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </header>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">IT Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-slate-300"
                >
                  {filtered.length}
                </Badge>
                <span className="text-slate-400">results</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, system, email"
                  className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-64"
                />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem key="all" value="all">
                      All Departments
                    </SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id || d._id || d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 w-full sm:w-auto"
                  onClick={() => {
                    setQuery("");
                    setDeptFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>System ID</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Emails</TableHead>
                    <TableHead>VG/VON</TableHead>
                    <TableHead>VG/VON ID</TableHead>
                    <TableHead>LM ID</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => navigate(`/it-preview/${r.id}`)}
                    >
                      <TableCell className="font-medium text-blue-400 hover:underline">
                        {r.employeeName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "active" ? "default" : "secondary"
                          }
                          className={
                            r.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {r.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{r.systemId}</TableCell>
                      <TableCell>{r.tableNumber}</TableCell>
                      <TableCell>
                        {r.emails.map((e) => e.email).join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        {r.vitelGlobal?.id
                          ? (r as any).vitelGlobal?.provider === "vonage"
                            ? "Vonage"
                            : "Vitel Global"
                          : "-"}
                      </TableCell>
                      <TableCell>{r.vitelGlobal?.id || "-"}</TableCell>
                      <TableCell>{r.lmPlayer.id || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/it-preview/${r.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Preview
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => (window.location.href = "/it")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Go to IT Form <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
