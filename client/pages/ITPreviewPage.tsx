import AppNav from "@/components/Navigation";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  ServerCog,
  Cpu,
  Smartphone,
  Mail,
  Pencil,
  AlertCircle,
} from "lucide-react";

interface ITRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: {
    provider?: string;
    providerCustom?: string;
    email: string;
    password?: string;
  }[];
  vitelGlobal: {
    id?: string;
    provider?: "vitel" | "vonage";
    type?: string;
    extNumber?: string;
    password?: string;
  };
  lmPlayer: { id?: string; password?: string; license?: string };
  notes?: string;
  createdAt: string;
}

export default function ITPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ITRecord | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [systemAssets, setSystemAssets] = useState<any[]>([]);
  const [pcLaptops, setPcLaptops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivatingLoading, setDeactivatingLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  const requirePasscode = () => {
    const code = prompt("Enter passcode to show passwords");
    if (code === "123") setShowPasswords(true);
    else if (code !== null) alert("Incorrect passcode");
  };

  const handleDeactivateUser = async () => {
    if (!deactivatePassword.trim()) {
      setDeactivateError("Please enter your password");
      return;
    }

    setDeactivatingLoading(true);
    setDeactivateError("");

    try {
      // Verify password by attempting login
      const currentUser = localStorage.getItem("currentUser");
      const verifyRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser,
          password: deactivatePassword,
        }),
      });

      if (!verifyRes.ok) {
        setDeactivateError("Incorrect password");
        setDeactivatingLoading(false);
        return;
      }

      // Password verified, now update the IT account status
      if (!record) return;

      const updateRes = await fetch(`/api/it-accounts/${record._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...record,
          status: "inactive",
        }),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        setDeactivateError(
          errData.error || "Failed to deactivate user"
        );
        setDeactivatingLoading(false);
        return;
      }

      // Success - redirect to dashboard
      alert("User account deactivated successfully");
      navigate("/it-dashboard");
    } catch (error) {
      setDeactivateError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setDeactivatingLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch IT Record
        const itRes = await fetch(`/api/it-accounts/${id}`);
        const itData = await itRes.json();

        if (itData.success && itData.data) {
          const rec = itData.data;
          setRecord(rec);

          // Fetch Employee Data
          const empRes = await fetch(`/api/employees/${rec.employeeId}`);
          const empData = await empRes.json();
          if (empData.success) setEmployee(empData.data);
        }

        // Fetch Assets and PC/Laptop for details
        const [assetsRes, pcRes] = await Promise.all([
          fetch("/api/system-assets"),
          fetch("/api/pc-laptop"),
        ]);

        const assetsData = await assetsRes.json();
        const pcData = await pcRes.json();

        if (assetsData.success) setSystemAssets(assetsData.data);
        if (pcData.success) setPcLaptops(pcData.data);
      } catch (error) {
        console.error("Error fetching preview data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">
          Loading IT Account Details...
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="text-white text-xl">IT Account not found</div>
        <Button onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  const initials = (record.employeeName || "?")
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");

  const providerAsset = record.vitelGlobal?.id
    ? systemAssets.find(
        (a) =>
          (record.vitelGlobal.provider === "vonage" &&
            (a.id === record.vitelGlobal.id ||
              a.vonageExtCode === record.vitelGlobal.id ||
              a.vonageNumber === record.vitelGlobal.id)) ||
          (record.vitelGlobal.provider !== "vonage" &&
            a.id === record.vitelGlobal.id),
      )
    : null;

  const pc = pcLaptops.find((x) => x.id === record.systemId) || {};
  const nameFor = (assetId: string) => {
    if (!assetId) return "-";
    const a = systemAssets.find((t) => t.id === assetId);
    return a ? `${a.companyName || a.vendorName || "-"} (${a.id})` : assetId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900 text-white">
      <AppNav />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white mb-4"
          onClick={() => navigate(-1)}
          title="Go back to previous page"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-blue-500/50">
              <AvatarImage src={employee?.photo || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-600 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {record.employeeName}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {record.department}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-slate-400 border-slate-700"
                >
                  Emp ID: {employee?.employeeId || record.employeeId}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate(`/it?editId=${record._id}`)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() =>
                showPasswords ? setShowPasswords(false) : requirePasscode()
              }
            >
              {showPasswords ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showPasswords ? "Hide Passwords" : "Show Passwords"}
            </Button>
            {record.status === "active" && (
              <Button
                variant="outline"
                className="border-orange-600/50 text-orange-400 hover:bg-orange-950/50"
                onClick={() => setShowDeactivateModal(true)}
              >
                <AlertCircle className="mr-2 h-4 w-4" /> Make Inactive
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Info */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <ServerCog className="h-4 w-4" /> System Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  System ID
                </div>
                <div className="text-lg font-semibold text-blue-400">
                  {record.systemId}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  Table Number
                </div>
                <div className="text-lg font-semibold">
                  {record.tableNumber}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Software */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Shield className="h-4 w-4" /> LM ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  LM ID
                </div>
                <div className="text-lg font-semibold">
                  {record.lmPlayer?.id || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  License Type
                </div>
                <div className="text-lg font-semibold capitalize">
                  {record.lmPlayer?.license || "Standard"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emails Section */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" /> Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.emails.map((e, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex flex-col space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="outline"
                      className="bg-slate-900 border-slate-600"
                    >
                      {e.providerCustom || e.provider || "Email Account"}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Email: </span>
                    <span className="text-white font-mono">{e.email}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Password: </span>
                    <span className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded">
                      {showPasswords ? e.password : "••••••••"}
                    </span>
                  </div>
                </div>
              ))}
              {record.emails.length === 0 && (
                <div className="text-slate-500 italic">
                  No email accounts linked
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* VG/VON Landscape View */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-400" /> VG/VON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="flex-1">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  VG/VON Provider
                </div>
                <div className="text-lg font-bold capitalize text-blue-400">
                  {record.vitelGlobal?.provider || "Vitel Global"}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  VG/VON ID
                </div>
                <div className="text-lg font-bold">
                  {record.vitelGlobal?.id || "-"}
                </div>
              </div>
              {providerAsset && (
                <>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {record.vitelGlobal?.provider === "vonage"
                        ? "Vonage Number"
                        : "Vitel Number"}
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {record.vitelGlobal?.provider === "vonage"
                        ? providerAsset.vonageNumber || "-"
                        : providerAsset.vitelGlobalNumber || "-"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {record.vitelGlobal?.provider === "vonage"
                        ? "Extension"
                        : "Username"}
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {record.vitelGlobal?.provider === "vonage"
                        ? providerAsset.vonageExtCode || "-"
                        : providerAsset.vitelUsername || "-"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Password
                    </div>
                    <div className="text-base font-bold font-mono bg-slate-900/80 px-3 py-2 rounded border border-slate-700">
                      {showPasswords
                        ? record.vitelGlobal?.provider === "vonage"
                          ? providerAsset.vonagePassword || "-"
                          : providerAsset.vitelPassword || "-"
                        : "••••••••"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Hardware Info */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" /> Hardware Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { label: "Mouse", value: nameFor(pc.mouseId) },
                { label: "Keyboard", value: nameFor(pc.keyboardId) },
                { label: "Motherboard", value: nameFor(pc.motherboardId) },
                { label: "Camera", value: nameFor(pc.cameraId) },
                { label: "Headphone", value: nameFor(pc.headphoneId) },
                { label: "Power Supply", value: nameFor(pc.powerSupplyId) },
                { label: "RAM", value: nameFor(pc.ramId) },
                { label: "Monitor", value: nameFor(pc.monitorId) },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {record.notes && (
          <Card className="bg-slate-900/50 border-slate-700 border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">
                {record.notes}
              </p>
            </CardContent>
          </Card>
        )}

        <footer className="text-xs text-slate-500 flex justify-between pt-4 border-t border-slate-800">
          <div>IT Asset Management System</div>
          <div>Created on {new Date(record.createdAt).toLocaleString()}</div>
        </footer>
      </main>

      {/* Deactivate User Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-900 border-slate-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" /> Deactivate User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                To deactivate <strong>{record.employeeName}</strong>'s IT account,
                please enter your password for verification.
              </p>

              {deactivateError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                  {deactivateError}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Your Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={deactivatePassword}
                  onChange={(e) => {
                    setDeactivatePassword(e.target.value);
                    setDeactivateError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !deactivatingLoading) {
                      handleDeactivateUser();
                    }
                  }}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  disabled={deactivatingLoading}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setDeactivatePassword("");
                    setDeactivateError("");
                  }}
                  disabled={deactivatingLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={handleDeactivateUser}
                  disabled={deactivatingLoading}
                >
                  {deactivatingLoading ? "Verifying..." : "Confirm Deactivate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
