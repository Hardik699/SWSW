import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SuccessModal from "@/components/SuccessModal";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import AppNav from "@/components/Navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CreateSalaryInput,
  ListDocumentsResponse,
  ListSalariesResponse,
  SalaryRecord,
  SalaryWithDocs,
  UserRole,
} from "@shared/api";
import { toast } from "sonner";
import { uploadFileToSupabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

function useRoleHeaders(role: UserRole, userId: string) {
  return useMemo(
    () => ({ "x-role": role, "x-user-id": userId }),
    [role, userId],
  );
}

export default function Salary() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [role, setRole] = useState<UserRole>("admin");
  const [userId, setUserId] = useState("user-1");

  const headers = useRoleHeaders(role, userId);

  const list = useQuery({
    queryKey: ["salaries", role, userId],
    queryFn: async (): Promise<ListSalariesResponse> => {
      const res = await fetch("/api/salaries", { headers });
      if (!res.ok) throw new Error("Failed to load salaries");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (input: CreateSalaryInput): Promise<SalaryRecord> => {
      const res = await fetch("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salaries"] }),
  });

  const [form, setForm] = useState({
    employeeName: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    notes: "",
  });

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
  }>({
    isOpen: false,
    title: "Success!",
    message: "Data saved successfully!",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateSalaryInput = {
      userId,
      employeeName: form.employeeName.trim(),
      month: Number(form.month),
      year: Number(form.year),
      amount: Number(form.amount),
      notes: form.notes?.trim() || undefined,
    };
    create.mutate(payload);
  };

  return (
    <>
      <AppNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                title="Go back to previous page"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Salary Records
              </h1>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap text-slate-300">
                  Role
                </Label>
                <select
                  className="flex-1 sm:flex-none rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-300 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap text-slate-300">
                  User ID
                </Label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1 sm:w-40 bg-slate-800 border-slate-700 text-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          <Card className="p-4 sm:p-6 bg-slate-900/50 border-slate-700">
            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4"
            >
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Employee Name</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, employeeName: e.target.value }))
                  }
                  className="bg-slate-800 border-slate-700 text-slate-300"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={form.month}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, month: Number(e.target.value) }))
                  }
                  className="bg-slate-800 border-slate-700 text-slate-300"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Year</Label>
                <Input
                  type="number"
                  min={1900}
                  max={3000}
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: Number(e.target.value) }))
                  }
                  className="bg-slate-800 border-slate-700 text-slate-300"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Amount</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                  }
                  className="bg-slate-800 border-slate-700 text-slate-300"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="bg-slate-800 border-slate-700 text-slate-300"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  Add Salary
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-3 sm:p-4 bg-slate-900/50 border-slate-700">
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-800">
                    <TableHead className="text-slate-300">Employee</TableHead>
                    <TableHead className="text-slate-300">Period</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300 hidden sm:table-cell">
                      Owner
                    </TableHead>
                    <TableHead className="text-slate-300 hidden md:table-cell">
                      Documents
                    </TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.data?.items.map((s) => (
                    <SalaryRow
                      key={s.id}
                      s={s}
                      headers={headers}
                      canManage={role === "admin" || s.userId === userId}
                      onChanged={() =>
                        qc.invalidateQueries({ queryKey: ["salaries"] })
                      }
                      onUploadSuccess={() =>
                        setSuccessModal({
                          isOpen: true,
                          title: "📄 Documents Uploaded!",
                          message:
                            "Your documents have been successfully uploaded.",
                        })
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          </Card>

          {/* Success Modal */}
          <SuccessModal
            isOpen={successModal.isOpen}
            title={successModal.title}
            message={successModal.message}
            onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
            autoClose={3000}
          />
        </div>
      </div>
    </>
  );
}

function SalaryRow({
  s,
  headers,
  canManage,
  onChanged,
  onUploadSuccess,
}: {
  s: SalaryRecord;
  headers: Record<string, string>;
  canManage: boolean;
  onChanged: () => void;
  onUploadSuccess?: () => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [docs, setDocs] = useState<ListDocumentsResponse | null>(null);
  const loadDocs = async () => {
    const res = await fetch(`/api/salaries/${s.id}/documents`, { headers });
    if (res.ok) setDocs(await res.json());
  };
  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async () => {
    if (!files || files.length === 0) return;

    try {
      toast.loading("Uploading documents to Supabase...");

      // Upload each file to Supabase and collect URLs
      const fileUrls: {
        originalName: string;
        url: string;
        mimeType: string;
      }[] = [];

      for (const file of Array.from(files)) {
        const fileUrl = await uploadFileToSupabase(
          file,
          "documents/salary-slips",
        );
        fileUrls.push({
          originalName: file.name,
          url: fileUrl,
          mimeType: file.type,
        });
      }

      toast.dismiss();
      toast.loading("Saving document metadata...");

      // Send URLs to server to save metadata
      const res = await fetch(`/api/salaries/${s.id}/documents`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrls }),
      });

      toast.dismiss();

      if (res.ok) {
        setDocs(await res.json());
        setFiles(null); // Clear selected files
        onUploadSuccess?.(); // Trigger success modal
      } else {
        toast.error("Failed to save document metadata");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
    }
  };

  const delSalary = async () => {
    if (!confirm("Delete salary?")) return;
    const res = await fetch(`/api/salaries/${s.id}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) onChanged();
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{s.employeeName}</TableCell>
      <TableCell>
        {s.month}/{s.year}
      </TableCell>
      <TableCell>{s.amount}</TableCell>
      <TableCell>{s.userId}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {docs?.items.map((d) => (
            <DocPreview
              key={d.id}
              url={d.url}
              mime={d.mimeType}
              name={d.originalName}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => setFiles(e.target.files)}
          />
          <Button size="sm" onClick={upload} disabled={!files}>
            Upload
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={!canManage}
            onClick={delSalary}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function DocPreview({
  url,
  mime,
  name,
}: {
  url: string;
  mime: string;
  name: string;
}) {
  if (mime.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={name}
        className="h-16 w-16 object-cover rounded-md border"
      />
    );
  }
  if (mime === "application/pdf") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline text-blue-400"
      >
        PDF: {name}
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="underline text-blue-400"
    >
      {name}
    </a>
  );
}
