import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  Users,
  User,
  Building2,
  Calendar,
  Clock,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  CalendarDays,
  UserCheck,
  UserX,
  Upload,
  Image,
  FileText,
  CreditCard,
  Landmark,
  Edit,
  MoreVertical,
  Filter,
  Download,
  Save,
  X,
  Eye,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFileToSupabase, uploadBase64ToSupabase } from "@/lib/supabase";
import { notifyNewEmployee } from "@/lib/notifications";
import AppNav from "@/components/Navigation";
import * as XLSX from "xlsx";
import SuccessModal from "@/components/SuccessModal";
import { ImageCropper } from "@/components/ImageCropper";
import {
  exportToCSV,
  exportToExcel,
  exportDepartmentSummary,
} from "@/lib/export";

interface SalaryRecord {
  _id?: string;
  id?: string;
  employeeId: string;
  month: string; // YYYY-MM format
  year: number;
  totalWorkingDays: number;
  actualWorkingDays: number;
  basicSalary: number;
  bonus?: number;
  deductions?: number;
  totalSalary: number;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

interface Employee {
  _id?: string;
  id?: string;
  employeeId: string; // Auto-generated employee ID
  // Personal Information
  fullName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  bloodGroup: string;
  mobileNumber: string;
  emergencyMobileNumber: string;
  alternativeMobileNumber: string;
  email: string;
  address: string;
  permanentAddress: string;
  photo?: string;

  // Job Information
  joiningDate: string;
  department: string;
  position: string;
  tableNumber: string;

  // Banking Details
  accountNumber: string;
  ifscCode: string;
  bankPassbook?: string;
  aadhaarNumber: string;
  panNumber: string;
  uanNumber: string;
  uanSkipReason?: string; // Reason if UAN is skipped
  salary: string;

  // Document Uploads
  aadhaarCard?: string;
  panCard?: string;
  drivingLicense?: string;
  resume?: string;
  medicalCertificate?: string;
  educationCertificate?: string;
  experienceLetter?: string;

  status: "active" | "inactive";
  deactivationReason?: string;
  resignationLetter?: string;
  deactivationDate?: string;
}

interface Department {
  _id?: string;
  id?: string;
  name: string;
  manager: string;
  employeeCount: number;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  sl1Start?: string;
  sl1End?: string;
  sl2Start?: string;
  sl2End?: string;
  notes?: string;
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Employee form state
  const [newEmployee, setNewEmployee] = useState({
    // Personal Information
    employeeId: "",
    fullName: "",
    fatherName: "",
    motherName: "",
    birthDate: "",
    bloodGroup: "",
    mobileNumber: "",
    emergencyMobileNumber: "",
    alternativeMobileNumber: "",
    email: "",
    address: "",
    permanentAddress: "",
    photo: "",

    // Job Information
    joiningDate: "",
    department: "",
    position: "",
    tableNumber: "",

    // Banking Details
    accountNumber: "",
    ifscCode: "",
    bankPassbook: "",
    aadhaarNumber: "",
    panNumber: "",
    uanNumber: "",
    salary: "",

    // Document Uploads
    aadhaarCard: "",
    panCard: "",
    drivingLicense: "",
    resume: "",
    medicalCertificate: "",
    educationCertificate: "",
    experienceLetter: "",
  });

  // File upload states
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [passbookPreview, setPassbookPreview] = useState<string>("");
  const [documentPreviews, setDocumentPreviews] = useState<{
    [key: string]: string;
  }>({});

  // Image cropper states
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [cropperMode, setCropperMode] = useState<"new" | "edit">("new");

  // UAN Number state
  const [uanSkipReason, setUanSkipReason] = useState<string>("");
  const [isUanSkipped, setIsUanSkipped] = useState<boolean>(false);

  // HR ID entry state
  const [isManualHRId, setIsManualHRId] = useState<boolean>(false);

  // Department form state
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    manager: "",
  });

  // Edit department state
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [editDepartmentForm, setEditDepartmentForm] = useState({
    name: "",
    manager: "",
  });

  // Filter states
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState<string>("");
  const [selectedDepartmentView, setSelectedDepartmentView] = useState<
    string | null
  >(null);

  // Deactivation modal state
  const [deactivationModal, setDeactivationModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    reason: string;
    resignationLetter: string;
    dateOfExit: string;
  }>({
    isOpen: false,
    employee: null,
    reason: "",
    resignationLetter: "",
    dateOfExit: "",
  });

  // Employee detail modal state
  const [employeeDetailModal, setEmployeeDetailModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    isEditing: boolean;
    editForm: Partial<Employee>;
    activeTab: "details" | "salary";
  }>({
    isOpen: false,
    employee: null,
    isEditing: false,
    editForm: {},
    activeTab: "details",
  });

  // Photo edit state
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");

  // Salary management state
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [salaryForm, setSalaryForm] = useState({
    month: "",
    totalWorkingDays: "",
    actualWorkingDays: "",
    basicSalary: "",
    bonus: "",
    deductions: "",
    paymentDate: "",
    notes: "",
  });
  const [showSalaryForm, setShowSalaryForm] = useState(false);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceDayMap, setAttendanceDayMap] = useState<
    Record<string, AttendanceRecord>
  >({});

  // Tab and employee selection state
  const [activeTab, setActiveTab] = useState<string>("employees");
  const [salaryUploadData, setSalaryUploadData] = useState<any[]>([]);
  const [leaveUploadData, setLeaveUploadData] = useState<any[]>([]);
  const [isUploadingSalary, setIsUploadingSalary] = useState(false);
  const [isUploadingLeave, setIsUploadingLeave] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkMonth, setBulkMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [bulkYear, setBulkYear] = useState(String(new Date().getFullYear()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const handleSalaryExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSalary(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setSalaryUploadData(json);
        toast.success("Salary details Excel parsed successfully!");
      } catch (error) {
        console.error("Error parsing salary Excel:", error);
        toast.error("Failed to parse salary Excel file");
      } finally {
        setIsUploadingSalary(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read salary Excel file");
      setIsUploadingSalary(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLeaveExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLeave(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setLeaveUploadData(json);
        toast.success("Leave details Excel parsed successfully!");
      } catch (error) {
        console.error("Error parsing leave Excel:", error);
        toast.error("Failed to parse leave Excel file");
      } finally {
        setIsUploadingLeave(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read leave Excel file");
      setIsUploadingLeave(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSubmit = async () => {
    if (salaryUploadData.length === 0 && leaveUploadData.length === 0) {
      toast.error("No data to submit. Please upload at least one Excel file.");
      return;
    }

    if (!bulkMonth) {
      toast.error("Please select a month and year for the records.");
      return;
    }

    setIsSubmittingBulk(true);
    toast.loading("Processing bulk upload...");

    try {
      const [yearStr, monthStr] = bulkMonth.split("-");
      let salaryResults = { success: 0, failed: 0 };
      let leaveResults = { success: 0, failed: 0 };

      // Upload salary records if available
      if (salaryUploadData.length > 0) {
        const salaryResponse = await fetch("/api/salary-records/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: salaryUploadData,
            month: bulkMonth,
            year: parseInt(yearStr),
          }),
        });

        const salaryResult = await salaryResponse.json();
        if (salaryResult.success) {
          salaryResults = salaryResult.results;
        } else {
          toast.error(`Salary upload failed: ${salaryResult.error || "Unknown error"}`);
          setIsSubmittingBulk(false);
          return;
        }
      }

      // Upload leave records if available
      if (leaveUploadData.length > 0) {
        const leaveResponse = await fetch("/api/leave-records/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: leaveUploadData,
            month: bulkMonth,
            year: parseInt(yearStr),
          }),
        });

        const leaveResult = await leaveResponse.json();
        if (leaveResult.success) {
          leaveResults = leaveResult.results;
        } else {
          toast.error(`Leave upload failed: ${leaveResult.error || "Unknown error"}`);
          setIsSubmittingBulk(false);
          return;
        }
      }

      toast.dismiss();

      // Show combined results
      const totalSuccess = salaryResults.success + leaveResults.success;
      const totalFailed = salaryResults.failed + leaveResults.failed;

      if (totalSuccess > 0) {
        const messages = [];
        if (salaryResults.success > 0) messages.push(`${salaryResults.success} salary records`);
        if (leaveResults.success > 0) messages.push(`${leaveResults.success} leave records`);
        toast.success(`Successfully processed: ${messages.join(", ")}`);
      }

      if (totalFailed > 0) {
        toast.warning(`${totalFailed} records failed. Check console for details.`);
        console.warn("Bulk upload errors:", { salary: salaryResults, leave: leaveResults });
      }

      // Clear data after successful upload
      setSalaryUploadData([]);
      setLeaveUploadData([]);
    } catch (error) {
      toast.dismiss();
      console.error("Bulk upload error:", error);
      toast.error("An error occurred during bulk upload");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const saveAttendanceRecords = async (updated: AttendanceRecord[]) => {
    setAttendanceRecords(updated);
    try {
      for (const record of updated) {
        if (record._id) {
          await fetch(`/api/attendance/${record._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
        } else {
          await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
        }
      }
    } catch (error) {
      console.error("Failed to save attendance records:", error);
    }
  };

  // Document preview modal state
  const [documentPreviewModal, setDocumentPreviewModal] = useState<{
    isOpen: boolean;
    documentUrl: string;
    documentType: string;
    employeeName: string;
  }>({
    isOpen: false,
    documentUrl: "",
    documentType: "",
    employeeName: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
  }>({
    isOpen: false,
    title: "Success!",
    message: "Data saved successfully!",
  });

  // Blood groups
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Check authentication and role-based access
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
    } else if (role !== "admin" && role !== "hr") {
      navigate("/"); // Redirect non-admin/non-hr users to home
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      if (userRole === "admin" || userRole === "hr") {
        try {
          const requests = [
            fetch("/api/employees").catch((err) => {
              console.error("Failed to fetch employees:", err);
              return new Response(
                JSON.stringify({ success: false, data: [] }),
                { status: 500 },
              );
            }),
            fetch("/api/departments").catch((err) => {
              console.error("Failed to fetch departments:", err);
              return new Response(
                JSON.stringify({ success: false, data: [] }),
                { status: 500 },
              );
            }),
            fetch("/api/leave-requests").catch((err) => {
              console.error("Failed to fetch leave requests:", err);
              return new Response(
                JSON.stringify({ success: false, data: [] }),
                { status: 500 },
              );
            }),
            fetch("/api/salary-records").catch((err) => {
              console.error("Failed to fetch salary records:", err);
              return new Response(
                JSON.stringify({ success: false, data: [] }),
                { status: 500 },
              );
            }),
            fetch("/api/attendance").catch((err) => {
              console.error("Failed to fetch attendance:", err);
              return new Response(
                JSON.stringify({ success: false, data: [] }),
                { status: 500 },
              );
            }),
          ];

          const [empRes, deptRes, leaveRes, salaryRes, attRes] =
            await Promise.all(requests);

          if (empRes.ok) {
            try {
              const empData = await empRes.json();
              if (empData.success && empData.data) {
                // Normalize employees: ensure id field is set to _id
                const normalizedEmployees = empData.data.map((emp: any) => ({
                  ...emp,
                  id: emp._id || emp.id,
                }));
                setEmployees(normalizedEmployees);
              }
            } catch (e) {
              console.error("Failed to parse employees response. This often happens if the connection is lost during body read or if the response is not valid JSON.", e);
            }
          }
          if (deptRes.ok) {
            try {
              const deptData = await deptRes.json();
              if (deptData.success && deptData.data) {
                // Normalize departments: ensure id field is set to _id
                const normalizedDepts = deptData.data.map((dept: any) => ({
                  ...dept,
                  id: dept._id || dept.id,
                }));
                setDepartments(normalizedDepts);
              }
            } catch (e) {
              console.error("Failed to parse departments response. This often happens if the connection is lost during body read or if the response is not valid JSON.", e);
            }
          }
          if (leaveRes.ok) {
            try {
              const leaveData = await leaveRes.json();
              if (leaveData.success && leaveData.data) {
                // Normalize leave requests: ensure id field is set to _id
                const normalizedLeaves = leaveData.data.map((leave: any) => ({
                  ...leave,
                  id: leave._id || leave.id,
                }));
                setLeaveRequests(normalizedLeaves);
              }
            } catch (e) {
              console.error("Failed to parse leave requests response:", e);
            }
          }
          if (salaryRes.ok) {
            try {
              const salaryData = await salaryRes.json();
              if (salaryData.success && salaryData.data) {
                // Normalize salary records: ensure id field is set to _id
                const normalizedSalaries = salaryData.data.map(
                  (salary: any) => ({
                    ...salary,
                    id: salary._id || salary.id,
                  }),
                );
                setSalaryRecords(normalizedSalaries);
              }
            } catch (e) {
              console.error("Failed to parse salary records response:", e);
            }
          }
          if (attRes.ok) {
            try {
              const attData = await attRes.json();
              if (attData.success && attData.data) {
                // Normalize attendance: ensure id field is set to _id
                const normalizedAtt = attData.data.map((att: any) => ({
                  ...att,
                  id: att._id || att.id,
                }));
                setAttendanceRecords(normalizedAtt);
              }
            } catch (e) {
              console.error("Failed to parse attendance response:", e);
            }
          }
        } catch (error) {
          console.error("Failed to load HR data from API:", error);
          // Silently fail - app will continue to work with empty data
        }
      }
    };
    loadData();
  }, [userRole]);

  // Prepare attendance day map for active employees on selected date
  useEffect(() => {
    if (userRole !== "admin" && userRole !== "hr") return;
    const active = employees.filter((e) => e.status === "active");
    const map: Record<string, AttendanceRecord> = {};
    active.forEach((emp) => {
      const existing = attendanceRecords.find(
        (r) => r.employeeId === emp.id && r.date === selectedDate,
      );
      map[emp.id] =
        existing ||
        ({
          employeeId: emp.id,
          date: selectedDate,
          present: true,
        } as AttendanceRecord);
    });
    setAttendanceDayMap(map);
  }, [userRole, employees, attendanceRecords, selectedDate]);

  // Auto-open newly added employee details
  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find((emp) => emp.id === selectedEmployeeId);
      if (employee) {
        handleOpenEmployeeDetail(employee);
        // Clear the selected employee ID after opening
        setSelectedEmployeeId(null);
      }
    }
  }, [selectedEmployeeId, employees]);

  // Save data to API
  const saveEmployees = async (updatedEmployees: Employee[]) => {
    const employeesWithIds: Employee[] = [];
    try {
      for (const emp of updatedEmployees) {
        if (emp._id) {
          // Update existing employee
          const { _id, id, ...empData } = emp;
          const response = await fetch(`/api/employees/${emp._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empData),
          });
          if (response.ok) {
            employeesWithIds.push({
              ...emp,
              id: emp._id, // Ensure id is synced with _id
            });
          } else {
            const errorData = await response.json();
            const errorMsg = errorData.error || "Failed to update employee";
            console.error("Failed to update employee:", errorMsg);
            toast.error(`Update failed: ${errorMsg}`);
          }
        } else {
          // Create new employee - capture returned _id
          const { _id, id, ...empData } = emp;
          const response = await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empData),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Store the returned _id from MongoDB and set id field
              employeesWithIds.push({
                ...emp,
                _id: result.data._id,
                id: result.data._id, // Sync id with _id for client-side lookups
              });
            } else {
              const errorMsg = result.error || "Unknown error";
              console.error("Server returned failure:", errorMsg);
              toast.error(`Creation failed: ${errorMsg}`);
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg =
              errorData.error || `Server error: ${response.status}`;
            console.error(
              "Failed to create employee:",
              errorMsg,
              response.status,
            );
            toast.error(`Creation failed: ${errorMsg}`);
          }
        }
      }
      // Update state with employees that have proper _ids
      setEmployees(employeesWithIds);
    } catch (error) {
      console.error("Failed to save employees:", error);
      toast.error("Failed to save employee. Check console for details.");
      setEmployees(updatedEmployees);
    }
  };

  const saveDepartments = async (updatedDepartments: Department[]) => {
    setDepartments(updatedDepartments);
    try {
      for (const dept of updatedDepartments) {
        const departmentId = dept._id || dept.id;
        if (departmentId) {
          // Update existing department
          const { _id, id, ...deptData } = dept;
          await fetch(`/api/departments/${departmentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deptData),
          });
        } else {
          // Create new department
          const { _id, id, ...deptData } = dept;
          const response = await fetch("/api/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deptData),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Update the department with the new _id from the server
              dept._id = result.data._id;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to save departments:", error);
    }
  };

  const saveLeaveRequests = async (updatedRequests: LeaveRequest[]) => {
    setLeaveRequests(updatedRequests);
    try {
      for (const req of updatedRequests) {
        if (req._id) {
          await fetch(`/api/leave-requests/${req._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
          });
        } else {
          await fetch("/api/leave-requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
          });
        }
      }
    } catch (error) {
      console.error("Failed to save leave requests:", error);
    }
  };

  const saveSalaryRecords = async (updatedRecords: SalaryRecord[]) => {
    setSalaryRecords(updatedRecords);
    try {
      for (const record of updatedRecords) {
        if (record._id) {
          await fetch(`/api/salary-records/${record._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
        } else {
          await fetch("/api/salary-records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
        }
      }
    } catch (error) {
      console.error("Failed to save salary records:", error);
    }
  };

  // Handle file uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToCrop(result);
        setCropperMode("new");
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassbookUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading("Uploading bank passbook...");
        const fileUrl = await uploadFileToSupabase(
          file,
          "documents/bank-passbooks",
        );
        toast.dismiss();
        toast.success("Bank passbook uploaded successfully");
        setPassbookPreview(fileUrl);
        setNewEmployee({ ...newEmployee, bankPassbook: fileUrl });
      } catch (error) {
        toast.dismiss();
        console.error("Error uploading passbook:", error);
        toast.error("Failed to upload bank passbook");
      }
    }
  };

  const handleDocumentUpload =
    (documentType: string) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          toast.loading(`Uploading ${documentType}...`);
          const fileUrl = await uploadFileToSupabase(
            file,
            `documents/${documentType.toLowerCase().replace(/\s+/g, "-")}`,
          );
          toast.dismiss();
          toast.success(`${documentType} uploaded successfully`);
          setDocumentPreviews({ ...documentPreviews, [documentType]: fileUrl });
          setNewEmployee({ ...newEmployee, [documentType]: fileUrl });
        } catch (error) {
          toast.dismiss();
          console.error(`Error uploading ${documentType}:`, error);
          toast.error(`Failed to upload ${documentType}`);
        }
      }
    };

  // Handle photo upload for edit form
  const handleEditPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToCrop(result);
        setCropperMode("edit");
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (cropperMode === "new") {
      setPhotoPreview(croppedImage);
      setNewEmployee({ ...newEmployee, photo: croppedImage });
    } else {
      setEditPhotoPreview(croppedImage);
      handleEditFormChange("photo", croppedImage);
    }
    setShowImageCropper(false);
    setImageToCrop("");
    toast.success("Photo cropped successfully!");
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop("");
  };

  // Generate next employee ID
  const getNextEmployeeId = () => {
    const empIds = employees
      .filter((e) => e.employeeId?.startsWith("EMP-"))
      .map((e) => {
        const num = parseInt(e.employeeId?.replace("EMP-", "") || "0", 10);
        return Number.isNaN(num) ? 0 : num;
      });
    const maxNum = empIds.length > 0 ? Math.max(...empIds) : 0;
    return `EMP-${String(maxNum + 1).padStart(3, "0")}`;
  };

  // Handle employee creation
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if UAN is either provided or skipped with reason
    const uanValid = newEmployee.uanNumber || (isUanSkipped && uanSkipReason);

    if (
      !newEmployee.fullName ||
      !newEmployee.email ||
      !newEmployee.department ||
      !newEmployee.tableNumber ||
      !newEmployee.aadhaarNumber ||
      !newEmployee.panNumber ||
      !uanValid ||
      !newEmployee.address ||
      !newEmployee.birthDate ||
      !newEmployee.mobileNumber ||
      !newEmployee.joiningDate ||
      !newEmployee.accountNumber ||
      !newEmployee.ifscCode
    ) {
      const missingFields = [];
      if (!newEmployee.fullName) missingFields.push("Full Name");
      if (!newEmployee.email) missingFields.push("Email");
      if (!newEmployee.department) missingFields.push("Department");
      if (!newEmployee.tableNumber) missingFields.push("Table Number");
      if (!newEmployee.aadhaarNumber) missingFields.push("Aadhaar Number");
      if (!newEmployee.panNumber) missingFields.push("PAN Number");
      if (!uanValid) missingFields.push("UAN Number (or skip with reason)");
      if (!newEmployee.address) missingFields.push("Current Address");
      if (!newEmployee.birthDate) missingFields.push("Birth Date");
      if (!newEmployee.mobileNumber) missingFields.push("Mobile Number");
      if (!newEmployee.joiningDate) missingFields.push("Joining Date");
      if (!newEmployee.accountNumber) missingFields.push("Account Number");
      if (!newEmployee.ifscCode) missingFields.push("IFSC Code");

      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }
    // Check if table number is already assigned to another active employee
    const usedTableNumbers = employees
      .filter(
        (e) =>
          e.status === "active" && e.tableNumber && e.id !== newEmployee.id,
      )
      .map((e) => e.tableNumber);

    if (usedTableNumbers.includes(newEmployee.tableNumber)) {
      alert(
        "Selected table/location is already assigned to an active employee",
      );
      return;
    }

    setIsLoading(true);

    try {
      const nextEmployeeId = getNextEmployeeId();
      const employee: Employee = {
        ...newEmployee,
        employeeId: newEmployee.employeeId || nextEmployeeId,
        status: "active",
        ...(isUanSkipped && uanSkipReason && { uanSkipReason }),
      };

      console.log("Creating employee with data:", employee);
      const updatedEmployees = [...employees, employee];
      await saveEmployees(updatedEmployees);

      // Update department employee count
      const updatedDepartments = departments.map((dept) =>
        dept.name === newEmployee.department
          ? { ...dept, employeeCount: dept.employeeCount + 1 }
          : dept,
      );
      await saveDepartments(updatedDepartments);

      // Send notification to IT department
      notifyNewEmployee(
        employee.employeeId,
        employee.fullName,
        employee.department,
        employee.tableNumber,
      );

      // Reset form
      setNewEmployee({
        employeeId: "",
        fullName: "",
        fatherName: "",
        motherName: "",
        birthDate: "",
        bloodGroup: "",
        mobileNumber: "",
        emergencyMobileNumber: "",
        alternativeMobileNumber: "",
        email: "",
        address: "",
        permanentAddress: "",
        photo: "",
        joiningDate: "",
        department: "",
        position: "",
        tableNumber: "",
        accountNumber: "",
        ifscCode: "",
        bankPassbook: "",
        aadhaarNumber: "",
        panNumber: "",
        uanNumber: "",
        salary: "",
        aadhaarCard: "",
        panCard: "",
        drivingLicense: "",
        resume: "",
        medicalCertificate: "",
        educationCertificate: "",
        experienceLetter: "",
      });
      setPhotoPreview("");
      setPassbookPreview("");
      setDocumentPreviews({});
      setUanSkipReason("");
      setIsUanSkipped(false);
      setIsManualHRId(false);

      // Show beautiful success modal
      setSuccessModal({
        isOpen: true,
        title: "🎉 Employee Created!",
        message: `${newEmployee.fullName} has been successfully added to the system.`,
      });
    } catch (error) {
      console.error("Failed to create employee:", error);
      toast.error("Failed to create employee. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle employee status toggle
  const handleToggleEmployeeStatus = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    if (employee.status === "active") {
      // If deactivating, open the deactivation modal
      handleOpenDeactivationModal(employee);
    } else {
      // If activating, directly activate without modal
      const updatedEmployees = employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              status: "active" as const,
              deactivationReason: undefined,
              deactivationDate: undefined,
            }
          : emp,
      );
      saveEmployees(updatedEmployees);
    }
  };

  // Handle department editing
  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartmentForm({
      name: department.name,
      manager: department.manager,
    });
  };

  const handleUpdateDepartment = () => {
    if (
      !editingDepartment ||
      !editDepartmentForm.name ||
      !editDepartmentForm.manager
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const editingDeptId = editingDepartment._id || editingDepartment.id;
    const updatedDepartments = departments.map((dept) => {
      const deptId = dept._id || dept.id;
      return deptId === editingDeptId
        ? {
            ...dept,
            name: editDepartmentForm.name,
            manager: editDepartmentForm.manager,
          }
        : dept;
    });
    saveDepartments(updatedDepartments);

    // Update employees if department name changed
    if (editingDepartment.name !== editDepartmentForm.name) {
      const updatedEmployees = employees.map((emp) =>
        emp.department === editingDepartment.name
          ? { ...emp, department: editDepartmentForm.name }
          : emp,
      );
      saveEmployees(updatedEmployees);
    }

    setEditingDepartment(null);
    setEditDepartmentForm({ name: "", manager: "" });
    setSuccessModal({
      isOpen: true,
      title: "✅ Department Updated!",
      message: `${editingDepartment?.name} has been updated successfully.`,
    });
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartment(null);
    setEditDepartmentForm({ name: "", manager: "" });
  };

  // Handle department creation
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.name || !newDepartment.manager) {
      toast.error("Please fill in all fields");
      return;
    }

    const department: Department = {
      name: newDepartment.name,
      manager: newDepartment.manager,
      employeeCount: 0,
    };

    const updatedDepartments = [...departments, department];
    await saveDepartments(updatedDepartments);

    // Reset form
    setNewDepartment({ name: "", manager: "" });
    setSuccessModal({
      isOpen: true,
      title: "🏢 Department Created!",
      message: `${newDepartment.name} has been successfully added to the system.`,
    });
  };

  // Handle employee deletion
  const handleDeleteEmployee = async (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    if (
      confirm(
        `Are you sure you want to delete employee "${employee.fullName}"?`,
      )
    ) {
      try {
        // Delete from API
        if (employee._id) {
          await fetch(`/api/employees/${employee._id}`, { method: "DELETE" });
        }

        const updatedEmployees = employees.filter(
          (emp) => emp.id !== employeeId,
        );
        setEmployees(updatedEmployees);

        // Update department employee count
        const updatedDepartments = departments.map((dept) =>
          dept.name === employee.department
            ? { ...dept, employeeCount: Math.max(0, dept.employeeCount - 1) }
            : dept,
        );
        await saveDepartments(updatedDepartments);
      } catch (error) {
        console.error("Failed to delete employee:", error);
      }
    }
  };

  // Utility functions
  const getEmployeesByDepartment = (departmentName: string) => {
    return employees.filter((emp) => emp.department === departmentName);
  };

  const getFilteredEmployees = () => {
    return employees.filter((emp) => {
      const statusMatch =
        employeeStatusFilter === "all" || emp.status === employeeStatusFilter;
      const departmentMatch =
        departmentFilter === "all" || emp.department === departmentFilter;

      // Search filter - search by name, email, employee ID, phone, department
      const searchLower = employeeSearchQuery.toLowerCase().trim();
      const searchMatch =
        !searchLower ||
        emp.fullName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId?.toLowerCase().includes(searchLower) ||
        emp.mobileNumber?.includes(searchLower) ||
        emp.department?.toLowerCase().includes(searchLower);

      return statusMatch && departmentMatch && searchMatch;
    });
  };

  // Deactivation functions
  const handleOpenDeactivationModal = (employee: Employee) => {
    setDeactivationModal({
      isOpen: true,
      employee,
      reason: "",
      resignationLetter: "",
    });
  };

  const handleCloseDeactivationModal = () => {
    setDeactivationModal({
      isOpen: false,
      employee: null,
      reason: "",
      resignationLetter: "",
      dateOfExit: "",
    });
  };

  const handleResignationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setDeactivationModal((prev) => ({
          ...prev,
          resignationLetter: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeactivateEmployee = () => {
    if (
      !deactivationModal.employee ||
      !deactivationModal.reason ||
      !deactivationModal.resignationLetter ||
      !deactivationModal.dateOfExit
    ) {
      alert(
        "Please provide a reason, upload resignation letter, and select date of exit",
      );
      return;
    }

    const updatedEmployees = employees.map((emp) =>
      emp.id === deactivationModal.employee!.id
        ? {
            ...emp,
            status: "inactive" as const,
            deactivationReason: deactivationModal.reason,
            resignationLetter: deactivationModal.resignationLetter,
            deactivationDate: deactivationModal.dateOfExit,
          }
        : emp,
    );
    saveEmployees(updatedEmployees);
    handleCloseDeactivationModal();
  };

  // Copy employee information
  const copyEmployeeInfo = (employee: Employee) => {
    const info = `
=== EMPLOYEE INFORMATION ===

Personal Details:
Name: ${employee.fullName}
Father's Name: ${employee.fatherName || "N/A"}
Mother's Name: ${employee.motherName || "N/A"}
Birth Date: ${employee.birthDate || "N/A"}
Blood Group: ${employee.bloodGroup || "N/A"}
Email: ${employee.email}
Mobile: ${employee.mobileNumber}
Emergency Mobile: ${employee.emergencyMobileNumber || "N/A"}
Address: ${employee.address || "N/A"}

Job Information:
Department: ${employee.department}
Position: ${employee.position || "N/A"}
Joining Date: ${employee.joiningDate || "N/A"}
Table Number: ${employee.tableNumber || "N/A"}
Salary: ${employee.salary || "N/A"}
Status: ${employee.status}

Banking Details:
Account Number: ${employee.accountNumber || "N/A"}
IFSC Code: ${employee.ifscCode || "N/A"}
Aadhaar Number: ${employee.aadhaarNumber || "N/A"}
PAN Number: ${employee.panNumber || "N/A"}
UAN Number: ${employee.uanNumber || "N/A"}

${
  employee.status === "inactive" && employee.deactivationReason
    ? `
Deactivation Details:
Reason: ${employee.deactivationReason}
Date: ${employee.deactivationDate || "N/A"}
Resignation Letter: ${employee.resignationLetter ? "On File" : "Not Available"}
`
    : ""
}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    navigator.clipboard
      .writeText(info)
      .then(() => {
        alert("Employee information copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy information");
      });
  };

  // Employee detail modal functions
  const handleOpenEmployeeDetail = (employee: Employee) => {
    navigate(`/employee/${employee.id}`);
  };

  const handleCloseEmployeeDetail = () => {
    setEmployeeDetailModal({
      isOpen: false,
      employee: null,
      isEditing: false,
      editForm: {},
      activeTab: "details",
    });
    // Clear photo preview
    setEditPhotoPreview("");
  };

  const handleStartEdit = () => {
    if (employeeDetailModal.employee) {
      setEmployeeDetailModal((prev) => ({
        ...prev,
        isEditing: true,
        editForm: { ...prev.employee! },
      }));
      // Initialize photo preview with current photo
      setEditPhotoPreview(employeeDetailModal.employee.photo || "");
    }
  };

  const handleCancelEdit = () => {
    setEmployeeDetailModal((prev) => ({
      ...prev,
      isEditing: false,
      editForm: {},
    }));
    // Clear photo preview
    setEditPhotoPreview("");
  };

  const handleSaveEmployee = () => {
    if (!employeeDetailModal.employee || !employeeDetailModal.editForm) return;

    const pendingTable =
      (employeeDetailModal.editForm.tableNumber as string) ??
      employeeDetailModal.employee.tableNumber;
    if (pendingTable) {
      const takenTableNumbers = employees
        .filter(
          (e) =>
            e.status === "active" &&
            e.id !== employeeDetailModal.employee!.id &&
            e.tableNumber,
        )
        .map((e) => e.tableNumber);

      if (takenTableNumbers.includes(pendingTable)) {
        alert(
          "Selected table/location is already assigned to an active employee",
        );
        return;
      }
    }

    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeDetailModal.employee!.id
        ? { ...emp, ...employeeDetailModal.editForm }
        : emp,
    );

    saveEmployees(updatedEmployees);
    setEmployeeDetailModal((prev) => ({
      ...prev,
      employee: { ...prev.employee!, ...prev.editForm },
      isEditing: false,
      editForm: {},
    }));
    setSuccessModal({
      isOpen: true,
      title: "✅ Updated!",
      message: `${employeeDetailModal.employee!.fullName}'s information has been updated successfully.`,
    });
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEmployeeDetailModal((prev) => ({
      ...prev,
      editForm: { ...prev.editForm, [field]: value },
    }));
  };

  // Salary management functions
  const getEmployeeSalaryRecords = (employeeId: string) => {
    return salaryRecords
      .filter((record) => record.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  };

  const handleAddSalaryRecord = () => {
    if (
      !employeeDetailModal.employee ||
      !salaryForm.month ||
      !salaryForm.totalWorkingDays ||
      !salaryForm.actualWorkingDays ||
      !salaryForm.basicSalary
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const basicSalary = parseFloat(salaryForm.basicSalary);
    const bonus = parseFloat(salaryForm.bonus) || 0;
    const deductions = parseFloat(salaryForm.deductions) || 0;
    const totalSalary = basicSalary + bonus - deductions;

    // Check if record already exists for this month
    const existingRecord = salaryRecords.find(
      (record) =>
        record.employeeId === employeeDetailModal.employee!.id &&
        record.month === salaryForm.month,
    );

    if (existingRecord) {
      alert(
        "Salary record already exists for this month. Please edit the existing record.",
      );
      return;
    }

    const newRecord: SalaryRecord = {
      id: Date.now().toString(),
      employeeId: employeeDetailModal.employee.id,
      month: salaryForm.month,
      year: parseInt(salaryForm.month.split("-")[0]),
      totalWorkingDays: parseInt(salaryForm.totalWorkingDays),
      actualWorkingDays: parseInt(salaryForm.actualWorkingDays),
      basicSalary: basicSalary,
      bonus: bonus || undefined,
      deductions: deductions || undefined,
      totalSalary: totalSalary,
      paymentDate: salaryForm.paymentDate || undefined,
      notes: salaryForm.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedRecords = [...salaryRecords, newRecord];
    saveSalaryRecords(updatedRecords);

    // Reset form
    setSalaryForm({
      month: "",
      totalWorkingDays: "",
      actualWorkingDays: "",
      basicSalary: "",
      bonus: "",
      deductions: "",
      paymentDate: "",
      notes: "",
    });
    setShowSalaryForm(false);
    alert("Salary record added successfully!");
  };

  const handleDeleteSalaryRecord = (recordId: string) => {
    if (confirm("Are you sure you want to delete this salary record?")) {
      const updatedRecords = salaryRecords.filter(
        (record) => record.id !== recordId,
      );
      saveSalaryRecords(updatedRecords);
    }
  };

  const resetSalaryForm = () => {
    setSalaryForm({
      month: "",
      totalWorkingDays: "",
      actualWorkingDays: "",
      basicSalary: "",
      bonus: "",
      deductions: "",
      paymentDate: "",
      notes: "",
    });
    setShowSalaryForm(false);
  };

  // Document preview functions
  const handleOpenDocumentPreview = (
    documentUrl: string,
    documentType: string,
    employeeName: string,
  ) => {
    setDocumentPreviewModal({
      isOpen: true,
      documentUrl,
      documentType,
      employeeName,
    });
  };

  const handleCloseDocumentPreview = () => {
    setDocumentPreviewModal({
      isOpen: false,
      documentUrl: "",
      documentType: "",
      employeeName: "",
    });
  };

  const documentTypes = [
    { key: "aadhaarCard", label: "Aadhaar Card", icon: CreditCard },
    { key: "panCard", label: "PAN Card", icon: CreditCard },
    { key: "drivingLicense", label: "Driving License", icon: CreditCard },
    { key: "resume", label: "Resume/CV", icon: FileText },
    { key: "medicalCertificate", label: "Medical Certificate", icon: FileText },
    {
      key: "educationCertificate",
      label: "Education Certificate",
      icon: FileText,
    },
    { key: "experienceLetter", label: "Experience Letter", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              HR Dashboard
            </h1>
            <p className="text-slate-400">Human Resources Management System</p>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
            title="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Employees</p>
                  <p className="text-2xl font-semibold text-white">
                    {employees.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Departments</p>
                  <p className="text-2xl font-semibold text-white">
                    {departments.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Employees</p>
                  <p className="text-2xl font-semibold text-white">
                    {employees.filter((emp) => emp.status === "active").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Inactive Employees</p>
                  <p className="text-2xl font-semibold text-white">
                    {
                      employees.filter((emp) => emp.status === "inactive")
                        .length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <UserX className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="employees"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </TabsTrigger>
            <TabsTrigger
              value="employee-details"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Employee Details
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="leaves"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Leave Requests
            </TabsTrigger>
            <TabsTrigger
              value="salary-upload"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Salary Upload
            </TabsTrigger>
          </TabsList>

          {/* Add Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 gap-8">
              {/* Add Employee Form */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-blue-400" />
                    <span>Add New Employee</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Complete employee registration form with all required
                    information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEmployee} className="space-y-8">
                    {/* Photo Upload Section */}
                    <div className="flex justify-end">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-800/30 overflow-hidden">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Employee"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <Image className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                              <p className="text-xs text-slate-500">
                                Employee Photo
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <User className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Personal Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="hr-id" className="text-slate-300">
                              HR ID{" "}
                              {isManualHRId
                                ? "(Manual Entry)"
                                : "(Auto-generated)"}
                            </Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setIsManualHRId(!isManualHRId);
                                if (!isManualHRId) {
                                  // When switching to auto mode, reset to auto-generated
                                  setNewEmployee({
                                    ...newEmployee,
                                    employeeId: "",
                                  });
                                }
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 h-auto p-1"
                            >
                              {isManualHRId ? "Auto" : "Manual"}
                            </Button>
                          </div>
                          <Input
                            id="hr-id"
                            value={
                              newEmployee.employeeId || getNextEmployeeId()
                            }
                            onChange={(e) => {
                              if (isManualHRId) {
                                setNewEmployee({
                                  ...newEmployee,
                                  employeeId: e.target.value,
                                });
                              }
                            }}
                            readOnly={!isManualHRId}
                            className={`${
                              isManualHRId
                                ? "bg-slate-800/50 border-slate-700 text-white cursor-text"
                                : "bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed"
                            }`}
                            placeholder={isManualHRId ? "Enter HR ID" : ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="full-name" className="text-slate-300">
                            Full Name *
                          </Label>
                          <Input
                            id="full-name"
                            value={newEmployee.fullName}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                fullName: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="father-name"
                            className="text-slate-300"
                          >
                            Father's Name
                          </Label>
                          <Input
                            id="father-name"
                            value={newEmployee.fatherName}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                fatherName: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="mother-name"
                            className="text-slate-300"
                          >
                            Mother's Name
                          </Label>
                          <Input
                            id="mother-name"
                            value={newEmployee.motherName}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                motherName: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="birth-date"
                            className="text-slate-300"
                          >
                            Birth Date <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="birth-date"
                            type="date"
                            required
                            value={newEmployee.birthDate}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                birthDate: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Blood Group</Label>
                          <Select
                            value={newEmployee.bloodGroup}
                            onValueChange={(value) =>
                              setNewEmployee({
                                ...newEmployee,
                                bloodGroup: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {bloodGroups.map((group) => (
                                <SelectItem
                                  key={`blood-group-${group}`}
                                  value={group}
                                >
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-300">
                            Email ID *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                email: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobile" className="text-slate-300">
                            Mobile Number{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="mobile"
                            required
                            value={newEmployee.mobileNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                mobileNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="emergency-mobile"
                            className="text-slate-300"
                          >
                            Emergency Mobile
                          </Label>
                          <Input
                            id="emergency-mobile"
                            value={newEmployee.emergencyMobileNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                emergencyMobileNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="alternative-mobile"
                            className="text-slate-300"
                          >
                            Alternative Number
                          </Label>
                          <Input
                            id="alternative-mobile"
                            value={newEmployee.alternativeMobileNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                alternativeMobileNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-slate-300">
                            Current Address{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <Textarea
                            id="address"
                            required
                            value={newEmployee.address}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                address: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white h-20"
                            placeholder="Enter current address..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="permanent-address"
                            className="text-slate-300"
                          >
                            Permanent Address
                          </Label>
                          <Textarea
                            id="permanent-address"
                            value={newEmployee.permanentAddress}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                permanentAddress: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white h-20"
                            placeholder="Enter permanent address..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Briefcase className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Job Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="joining-date"
                            className="text-slate-300"
                          >
                            Joining Date <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="joining-date"
                            type="date"
                            required
                            value={newEmployee.joiningDate}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                joiningDate: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Department *</Label>
                          <Select
                            value={newEmployee.department}
                            onValueChange={(value) =>
                              setNewEmployee({
                                ...newEmployee,
                                department: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {departments.map((dept) => (
                                <SelectItem
                                  key={dept._id || dept.id || dept.name}
                                  value={dept.name}
                                >
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position" className="text-slate-300">
                            Position
                          </Label>
                          <Input
                            id="position"
                            value={newEmployee.position}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                position: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="Software Engineer"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Table Number</Label>
                          <Select
                            value={newEmployee.tableNumber}
                            onValueChange={(val) =>
                              setNewEmployee({
                                ...newEmployee,
                                tableNumber: val,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select table or location" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60 overflow-y-auto">
                              {/* Room/Location options */}
                              {["Room1", "Room2", "IT"].map((room) => (
                                <SelectItem key={room} value={room}>
                                  {room}
                                </SelectItem>
                              ))}
                              {/* Numeric table options (1-32) */}
                              {Array.from({ length: 32 }, (_, i) => i + 1)
                                .filter(
                                  (n) =>
                                    !new Set(
                                      employees
                                        .filter(
                                          (e) =>
                                            e.status === "active" &&
                                            e.tableNumber,
                                        )
                                        .map((e) => {
                                          const num = parseInt(
                                            e.tableNumber,
                                            10,
                                          );
                                          return !Number.isNaN(num)
                                            ? num
                                            : null;
                                        })
                                        .filter((n) => n !== null),
                                    ).has(n),
                                )
                                .map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    Table {n}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Banking Details Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Landmark className="h-5 w-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Banking Details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="account-number"
                            className="text-slate-300"
                          >
                            Account Number{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="account-number"
                            required
                            value={newEmployee.accountNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                accountNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="1234567890123456"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ifsc-code" className="text-slate-300">
                            IFSC Code <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="ifsc-code"
                            required
                            value={newEmployee.ifscCode}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                ifscCode: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="SBIN0001234"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="salary" className="text-slate-300">
                            Salary
                          </Label>
                          <Input
                            id="salary"
                            value={newEmployee.salary}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                salary: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="₹50,000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="aadhaar-number"
                            className="text-slate-300"
                          >
                            Aadhaar Number{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="aadhaar-number"
                            required
                            value={newEmployee.aadhaarNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                aadhaarNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="1234 5678 9012"
                            maxLength={14}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="pan-number"
                            className="text-slate-300"
                          >
                            PAN Number <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="pan-number"
                            required
                            value={newEmployee.panNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                panNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="ABCDE1234F"
                            maxLength={10}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="uan-number"
                            className="text-slate-300"
                          >
                            UAN Number
                          </Label>
                          <Input
                            id="uan-number"
                            value={newEmployee.uanNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                uanNumber: e.target.value,
                              })
                            }
                            disabled={isUanSkipped}
                            className="bg-slate-800/50 border-slate-700 text-white disabled:opacity-50"
                            placeholder="123456789012"
                          />
                          <div className="flex items-center space-x-2 mt-2">
                            <input
                              type="checkbox"
                              id="skip-uan"
                              checked={isUanSkipped}
                              onChange={(e) => {
                                setIsUanSkipped(e.target.checked);
                                if (e.target.checked) {
                                  setNewEmployee({
                                    ...newEmployee,
                                    uanNumber: "",
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-600 text-blue-500 cursor-pointer"
                            />
                            <label
                              htmlFor="skip-uan"
                              className="text-sm text-slate-400 cursor-pointer"
                            >
                              Skip UAN (provide reason)
                            </label>
                          </div>
                          {isUanSkipped && (
                            <div className="mt-2 space-y-2">
                              <Label
                                htmlFor="uan-skip-reason"
                                className="text-slate-300"
                              >
                                Reason for skipping{" "}
                                <span className="text-red-400">*</span>
                              </Label>
                              <Textarea
                                id="uan-skip-reason"
                                value={uanSkipReason}
                                onChange={(e) =>
                                  setUanSkipReason(e.target.value)
                                }
                                placeholder="e.g., Employee is a contractor, Under processing, Not applicable..."
                                className="bg-slate-800/50 border-slate-700 text-white h-16"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bank Passbook Upload */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-orange-400" />
                          <Label className="text-slate-300">
                            Bank Passbook Upload
                          </Label>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handlePassbookUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Passbook
                            </Button>
                          </div>
                          {passbookPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                              onClick={() =>
                                handleOpenDocumentPreview(
                                  passbookPreview,
                                  "Bank Passbook",
                                  newEmployee.fullName || "New Employee",
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          )}
                          {passbookPreview && (
                            <div className="flex items-center space-x-2 text-green-400 text-sm">
                              <FileText className="h-4 w-4" />
                              <span>File uploaded successfully</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Uploads Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Upload className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Document Uploads
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {documentTypes.map((docType) => {
                          const IconComponent = docType.icon;
                          const isUploaded = documentPreviews[docType.key];

                          return (
                            <div key={docType.key} className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4 text-purple-400" />
                                <Label className="text-slate-300">
                                  {docType.label}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleDocumentUpload(docType.key)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`border-slate-600 text-slate-300 ${isUploaded ? "border-green-500 text-green-400" : ""}`}
                                  >
                                    <Upload className="h-3 w-3 mr-2" />
                                    {isUploaded ? "Replace" : "Upload"}
                                  </Button>
                                </div>
                                {isUploaded && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300"
                                    onClick={() =>
                                      handleOpenDocumentPreview(
                                        documentPreviews[docType.key],
                                        docType.label,
                                        newEmployee.fullName || "New Employee",
                                      )
                                    }
                                  >
                                    <Eye className="h-3 w-3 mr-2" />
                                    Preview
                                  </Button>
                                )}
                                {isUploaded && (
                                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                                    <FileText className="h-3 w-3" />
                                    <span>Uploaded ✓</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                        <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span>Upload Guidelines</span>
                        </h4>
                        <ul className="text-slate-400 text-sm space-y-1">
                          <li>• Supported formats: JPG, PNG, PDF, DOC, DOCX</li>
                          <li>• Maximum file size: 10MB per document</li>
                          <li>• Ensure documents are clear and readable</li>
                          <li>
                            • All documents are securely stored and encrypted
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                      >
                        {isLoading ? "Adding Employee..." : "Add Employee"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employee Details Tab */}
          <TabsContent value="employee-details" className="space-y-6">
            {/* Employee Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Status Filter */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Filter className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">
                        Filter by Status:
                      </span>
                    </div>
                    <Tabs
                      value={employeeStatusFilter}
                      onValueChange={(value) =>
                        setEmployeeStatusFilter(
                          value as "all" | "active" | "inactive",
                        )
                      }
                      className="w-auto"
                    >
                      <TabsList className="bg-slate-800/50 border border-slate-700">
                        <TabsTrigger
                          value="all"
                          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                        >
                          All ({employees.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="active"
                          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Active (
                          {
                            employees.filter((emp) => emp.status === "active")
                              .length
                          }
                          )
                        </TabsTrigger>
                        <TabsTrigger
                          value="inactive"
                          className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Inactive (
                          {
                            employees.filter((emp) => emp.status === "inactive")
                              .length
                          }
                          )
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Department Filter */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Building2 className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">
                        Filter by Department:
                      </span>
                    </div>
                    <Select
                      value={departmentFilter}
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem key="all-departments" value="all">
                          All Departments
                        </SelectItem>
                        {departments.map((dept) => (
                          <SelectItem
                            key={dept._id || dept.id || dept.name}
                            value={dept.name}
                          >
                            {dept.name} (
                            {getEmployeesByDepartment(dept.name).length})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employees List */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-400" />
                    <span>Employee Details</span>
                    <Badge
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {getFilteredEmployees().length} of {employees.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Search by name, email, ID, phone, or department..."
                    value={employeeSearchQuery}
                    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
                  />
                  {employeeSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEmployeeSearchQuery("")}
                      className="text-slate-400 hover:text-white"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {getFilteredEmployees().length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {employees.length === 0
                        ? "No employees added yet"
                        : `No ${employeeStatusFilter} employees found`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredEmployees().map((employee) => (
                      <div
                        key={employee._id || employee.id || employee.employeeId}
                        className="p-4 bg-slate-800/30 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            {employee.photo && (
                              <img
                                src={employee.photo}
                                alt={employee.fullName}
                                className="w-12 h-12 rounded-full object-cover border border-slate-600 cursor-pointer hover:border-blue-400 transition-colors"
                                onClick={() =>
                                  handleOpenEmployeeDetail(employee)
                                }
                                title="Click to view full details"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-white font-medium">
                                  {employee.fullName}
                                </h4>
                                {employee.employeeId && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  >
                                    {employee.employeeId}
                                  </Badge>
                                )}
                                <Button
                                  onClick={() =>
                                    handleToggleEmployeeStatus(employee.id)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className={`px-3 py-1 text-xs border ${
                                    employee.status === "active"
                                      ? "border-green-500 text-green-400 hover:bg-green-500/20"
                                      : "border-red-500 text-red-400 hover:bg-red-500/20"
                                  }`}
                                >
                                  {employee.status === "active" ? (
                                    <>
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-3 w-3 mr-1" />
                                      Inactive
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{employee.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-3 w-3" />
                                  <span>{employee.department}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{employee.mobileNumber}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Briefcase className="h-3 w-3" />
                                  <span>{employee.position}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-block h-3 w-3 text-slate-400">
                                    #
                                  </span>
                                  <span>
                                    {employee.tableNumber
                                      ? isNaN(Number(employee.tableNumber))
                                        ? employee.tableNumber
                                        : `Table ${employee.tableNumber}`
                                      : "-"}
                                  </span>
                                </div>
                                {employee.joiningDate && (
                                  <div className="flex items-center space-x-2">
                                    <CalendarDays className="h-3 w-3" />
                                    <span>Joined: {employee.joiningDate}</span>
                                  </div>
                                )}
                                {employee.salary && (
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{employee.salary}</span>
                                  </div>
                                )}
                              </div>

                              {/* Deactivation Information for Inactive Employees */}
                              {employee.status === "inactive" &&
                                employee.deactivationReason && (
                                  <div className="mt-3 pt-3 border-t border-red-700/30">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <UserX className="h-4 w-4 text-red-400" />
                                        <span className="text-sm font-medium text-red-400">
                                          Deactivation Details
                                        </span>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="text-slate-400">
                                            Reason:{" "}
                                          </span>
                                          <span className="text-slate-300">
                                            {employee.deactivationReason}
                                          </span>
                                        </div>
                                        {employee.deactivationDate && (
                                          <div>
                                            <span className="text-slate-400">
                                              Date:{" "}
                                            </span>
                                            <span className="text-slate-300">
                                              {employee.deactivationDate}
                                            </span>
                                          </div>
                                        )}
                                        {employee.resignationLetter && (
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <FileText className="h-3 w-3 text-green-400" />
                                              <span className="text-green-400 text-xs">
                                                Resignation letter on file
                                              </span>
                                            </div>
                                            <Button
                                              onClick={() =>
                                                handleOpenDocumentPreview(
                                                  employee.resignationLetter!,
                                                  "Resignation Letter",
                                                  employee.fullName,
                                                )
                                              }
                                              variant="outline"
                                              size="sm"
                                              className="h-5 px-2 text-xs border-green-500 text-green-400 hover:bg-green-500/20"
                                            >
                                              <Image className="h-2 w-2 mr-1" />
                                              View
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Document Status */}
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText className="h-3 w-3 text-blue-400" />
                                  <span className="text-xs text-slate-400">
                                    Documents:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {documentTypes.map((docType) => {
                                    const hasDoc =
                                      employee[docType.key as keyof Employee];
                                    return (
                                      <Badge
                                        key={docType.key}
                                        variant="secondary"
                                        className={`text-xs px-2 py-1 cursor-pointer ${
                                          hasDoc
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                            : "bg-slate-700/50 text-slate-500 border border-slate-600"
                                        }`}
                                        onClick={() => {
                                          if (hasDoc) {
                                            handleOpenDocumentPreview(
                                              hasDoc as string,
                                              docType.label,
                                              employee.fullName,
                                            );
                                          }
                                        }}
                                        title={
                                          hasDoc
                                            ? "Click to preview document"
                                            : "Document not uploaded"
                                        }
                                      >
                                        {docType.label.split(" ")[0]}{" "}
                                        {hasDoc ? "✓" : "✗"}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                                <DropdownMenuItem
                                  key="view-details"
                                  onClick={() =>
                                    handleOpenEmployeeDetail(employee)
                                  }
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  View Full Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  key="copy-info"
                                  onClick={() => copyEmployeeInfo(employee)}
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Copy Employee Info
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  key="toggle-status"
                                  onClick={() =>
                                    handleToggleEmployeeStatus(employee.id)
                                  }
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  {employee.status === "active" ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Deactivate Employee
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activate Employee
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  key="delete-employee"
                                  onClick={() =>
                                    handleDeleteEmployee(employee.id)
                                  }
                                  className="cursor-pointer hover:bg-red-600 text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Employee
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Department Form */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-blue-400" />
                    <span>Add New Department</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dept-name" className="text-slate-300">
                        Department Name
                      </Label>
                      <Input
                        id="dept-name"
                        value={newDepartment.name}
                        onChange={(e) =>
                          setNewDepartment({
                            ...newDepartment,
                            name: e.target.value,
                          })
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept-manager" className="text-slate-300">
                        Department Manager
                      </Label>
                      <Input
                        id="dept-manager"
                        value={newDepartment.manager}
                        onChange={(e) =>
                          setNewDepartment({
                            ...newDepartment,
                            manager: e.target.value,
                          })
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Add Department
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Departments List */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-400" />
                    <span>Departments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {departments.map((department) => {
                      const departmentEmployees = getEmployeesByDepartment(
                        department.name,
                      );
                      const actualEmployeeCount = departmentEmployees.length;
                      const deptId = department._id || department.id;

                      return (
                        <div
                          key={deptId || department.name}
                          className="space-y-3"
                        >
                          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                            {editingDepartment?._id === deptId ||
                            editingDepartment?.id === department.id ? (
                              /* Edit Mode */
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-slate-300">
                                    Department Name
                                  </Label>
                                  <Input
                                    value={editDepartmentForm.name}
                                    onChange={(e) =>
                                      setEditDepartmentForm({
                                        ...editDepartmentForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-slate-300">
                                    Department Manager
                                  </Label>
                                  <Input
                                    value={editDepartmentForm.manager}
                                    onChange={(e) =>
                                      setEditDepartmentForm({
                                        ...editDepartmentForm,
                                        manager: e.target.value,
                                      })
                                    }
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={handleUpdateDepartment}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancelEditDepartment}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-white font-medium text-lg">
                                      {department.name}
                                    </h4>
                                    <Badge
                                      variant="secondary"
                                      className="bg-slate-700 text-slate-300"
                                    >
                                      {actualEmployeeCount} employees
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-sm mb-3">
                                    Manager: {department.manager}
                                  </p>

                                  {/* Show/Hide Employees Button */}
                                  <Button
                                    onClick={() =>
                                      setSelectedDepartmentView(
                                        selectedDepartmentView ===
                                          department.name
                                          ? null
                                          : department.name,
                                      )
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    {selectedDepartmentView === department.name
                                      ? "Hide"
                                      : "Show"}{" "}
                                    Employees
                                  </Button>
                                </div>
                                <Button
                                  onClick={() =>
                                    handleEditDepartment(department)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Department Employees List */}
                          {selectedDepartmentView === department.name && (
                            <Card className="bg-slate-800/50 border-slate-600 ml-4">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-white text-base flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-blue-400" />
                                  <span>Employees in {department.name}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {departmentEmployees.length === 0 ? (
                                  <div className="text-center py-4">
                                    <User className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">
                                      No employees in this department
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {departmentEmployees.map((employee) => (
                                      <div
                                        key={
                                          employee._id ||
                                          employee.id ||
                                          employee.employeeId
                                        }
                                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                                      >
                                        <div className="flex items-center space-x-3">
                                          {employee.photo && (
                                            <img
                                              src={employee.photo}
                                              alt={employee.fullName}
                                              className="w-8 h-8 rounded-full object-cover border border-slate-500"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <h5 className="text-white text-sm font-medium">
                                                {employee.fullName}
                                              </h5>
                                              <Badge
                                                className={`text-xs ${
                                                  employee.status === "active"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}
                                              >
                                                {employee.status}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                                              <span>
                                                {employee.position ||
                                                  "No position set"}
                                              </span>
                                              <span className="flex items-center space-x-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{employee.email}</span>
                                              </span>
                                              {employee.mobileNumber && (
                                                <span className="flex items-center space-x-1">
                                                  <Phone className="h-3 w-3" />
                                                  <span>
                                                    {employee.mobileNumber}
                                                  </span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            onClick={() =>
                                              handleToggleEmployeeStatus(
                                                employee.id,
                                              )
                                            }
                                            variant="outline"
                                            size="sm"
                                            className={`px-2 py-1 text-xs border ${
                                              employee.status === "active"
                                                ? "border-red-500 text-red-400 hover:bg-red-500/20"
                                                : "border-green-500 text-green-400 hover:bg-green-500/20"
                                            }`}
                                          >
                                            {employee.status === "active"
                                              ? "Deactivate"
                                              : "Activate"}
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span>Attendance Tracking</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor employee attendance and working hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Attendance System
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Track employee check-ins, check-outs, and working hours
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-400"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Requests Tab */}
          <TabsContent value="leaves" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <span>Leave Requests</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage employee leave requests and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Leave Management
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Handle vacation requests, sick leaves, and time-off
                    approvals
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/20 text-orange-400"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary Upload Tab */}
          <TabsContent value="salary-upload" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Salary Details Upload */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <span>1) Salary Details Excel</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload monthly salary details Excel file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center bg-slate-800/30">
                    <Upload className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">
                      {salaryUploadData.length > 0
                        ? `${salaryUploadData.length} records parsed`
                        : "Click to upload salary details Excel"}
                    </p>
                    <div className="flex justify-center">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx, .xls, .csv"
                          onChange={handleSalaryExcelUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploadingSalary}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          {isUploadingSalary ? "Processing..." : "Choose File"}
                        </Button>
                      </div>
                    </div>
                    {salaryUploadData.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSalaryUploadData([])}
                        className="mt-4 text-slate-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-medium text-white mb-2">
                      Required Columns:
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      ID, S No, Name, UAN Number, ESIC IP Numbers, Company,
                      Department, Status, CTC, Employer PF, Employer ESIC,
                      Aadhar Card, DOJ, A/C No., IFSC Code, Actual Gross, Actual
                      Basic, Actual HRA, Actual Conveyance, Actual Spl
                      Allowance, Actual Payable Gross, Total Days, Days Worked,
                      Earned Basic, Earned HRA, Earned Conveyance, Earned Spl
                      Allowance, Earned GROSS, Payable PF Info, PF, ESIC, ESIC
                      info, PT, Retention, Deduction, Advance, Any, Total
                      Deduction, Net Salary, Incentive1, Incentive2, Final
                      Salary, Bonus, Gratuity, Adjustment, TDS, Salary Paid
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Details Upload */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5 text-orange-400" />
                    <span>2) Leave Details Excel</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload monthly leave details Excel file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center bg-slate-800/30">
                    <Upload className="h-10 w-10 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">
                      {leaveUploadData.length > 0
                        ? `${leaveUploadData.length} records parsed`
                        : "Click to upload leave details Excel"}
                    </p>
                    <div className="flex justify-center">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx, .xls, .csv"
                          onChange={handleLeaveExcelUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploadingLeave}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                        >
                          {isUploadingLeave ? "Processing..." : "Choose File"}
                        </Button>
                      </div>
                    </div>
                    {leaveUploadData.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLeaveUploadData([])}
                        className="mt-4 text-slate-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-medium text-white mb-3">
                      Required Columns & Salary Slip Mapping:
                    </h4>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <p className="font-bold text-blue-400 mb-1">Paid Leave (PL):</p>
                          <p>Total Leave In The Account (PL) → Total Leave In The Account</p>
                          <p>TOTAL LEAVE TAKEN (PL) → Leave Availed</p>
                          <p>LEAVE BALANCE (PL) → Subsisting Leave</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-400 mb-1">Casual Leave (CL):</p>
                          <p>Total Leave In The Account (CL) → Total Leave In The Account</p>
                          <p>TOTAL LEAVE TAKEN (CL) → Leave Availed</p>
                          <p>LEAVE BALANCE (CL) → Subsisting Leave</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-400 mb-1">Sick Leave (SL):</p>
                          <p>Total Leave In The Account (SL) → Total Leave In The Account</p>
                          <p>TOTAL LEAVE TAKEN (SL) → Leave Availed</p>
                          <p>LEAVE BALANCE (SL) → Subsisting Leave</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Preview */}
            {(salaryUploadData.length > 0 || leaveUploadData.length > 0) && (
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Uploaded Data Preview</CardTitle>
                  <CardDescription className="text-slate-400">
                    Showing first few records from the uploaded files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-end gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                    <div className="w-full sm:w-auto space-y-2">
                      <Label htmlFor="bulk-month" className="text-slate-300">Target Month & Year</Label>
                      <Input
                        id="bulk-month"
                        type="month"
                        value={bulkMonth}
                        onChange={(e) => setBulkMonth(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleBulkSubmit}
                      disabled={isSubmittingBulk || (salaryUploadData.length === 0 && leaveUploadData.length === 0)}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSubmittingBulk ? "Processing..." : "Submit and Save Data"}
                    </Button>
                  </div>

                  <Tabs defaultValue="salary-preview">
                    <TabsList className="bg-slate-800/50 border border-slate-700 mb-4">
                      <TabsTrigger value="salary-preview">Salary Details ({salaryUploadData.length})</TabsTrigger>
                      <TabsTrigger value="leave-preview">Leave Details ({leaveUploadData.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="salary-preview">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-700 hover:bg-transparent">
                              <TableHead className="text-slate-300">Name</TableHead>
                              <TableHead className="text-slate-300">ID</TableHead>
                              <TableHead className="text-slate-300">Department</TableHead>
                              <TableHead className="text-slate-300">Net Salary</TableHead>
                              <TableHead className="text-slate-300">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salaryUploadData.slice(0, 5).map((row, idx) => (
                              <TableRow key={idx} className="border-slate-700 hover:bg-slate-800/30">
                                <TableCell className="text-white">{row.Name || row.name || "N/A"}</TableCell>
                                <TableCell className="text-slate-300">{row.ID || row.id || "N/A"}</TableCell>
                                <TableCell className="text-slate-300">{row.Department || row.department || "N/A"}</TableCell>
                                <TableCell className="text-green-400 font-medium">₹{row["Net Salary"] || row.net_salary || "0"}</TableCell>
                                <TableCell className="text-slate-300">{row.Status || row.status || "N/A"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {salaryUploadData.length > 5 && (
                          <p className="text-xs text-slate-500 mt-4 text-center">
                            Showing first 5 of {salaryUploadData.length} records
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="leave-preview">
                       <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-slate-700 hover:bg-transparent">
                              {leaveUploadData.length > 0 && Object.keys(leaveUploadData[0]).slice(0, 5).map(key => (
                                <TableHead key={key} className="text-slate-300">{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {leaveUploadData.slice(0, 5).map((row, idx) => (
                              <TableRow key={idx} className="border-slate-700 hover:bg-slate-800/30">
                                {Object.values(row).slice(0, 5).map((val: any, vIdx) => (
                                  <TableCell key={vIdx} className="text-slate-300">{String(val)}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                         {leaveUploadData.length > 5 && (
                          <p className="text-xs text-slate-500 mt-4 text-center">
                            Showing first 5 of {leaveUploadData.length} records
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Bulk Download All Slips Section */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Download className="h-5 w-5 text-purple-400" />
                  <span>3) Bulk Download All Employee Slips</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Download all employee salary slips for a specific month as a ZIP file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Select Month</Label>
                    <select
                      value={bulkMonth}
                      onChange={(e) => setBulkMonth(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = String(i + 1).padStart(2, '0');
                        return (
                          <option key={month} value={month}>
                            {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Select Year</Label>
                    <select
                      value={bulkYear}
                      onChange={(e) => setBulkYear(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    if (!bulkMonth || !bulkYear) {
                      toast.error('Please select both month and year');
                      return;
                    }
                    
                    try {
                      toast.info('Generating all salary slips... This may take a while.');
                      
                      const monthStr = `${bulkYear}-${bulkMonth}`;
                      const response = await fetch(`/api/salary-slips/bulk-download?month=${monthStr}`);
                      
                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to generate slips');
                      }
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `All_Salary_Slips_${monthStr}.zip`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      
                      toast.success('All salary slips downloaded successfully!');
                    } catch (error: any) {
                      console.error('Error downloading slips:', error);
                      toast.error(error.message || 'Failed to download salary slips');
                    }
                  }}
                  disabled={!bulkMonth || !bulkYear}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Slips as ZIP
                </Button>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-white mb-2">Note:</h4>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li>Each PDF will be named: EmployeeName_Month_Year.pdf</li>
                    <li>All PDFs are password protected with last 4 digits of UAN</li>
                    <li>Only employees with salary records for selected month will be included</li>
                    <li>This process may take a few minutes depending on number of employees</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Deactivation Modal */}
        {deactivationModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-red-400" />
                  <span>Deactivate Employee</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Provide reason and upload resignation letter (mandatory)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                  <p className="text-white font-medium">
                    {deactivationModal.employee?.fullName}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {deactivationModal.employee?.department} -{" "}
                    {deactivationModal.employee?.position}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Reason for Deactivation *
                  </Label>
                  <Textarea
                    value={deactivationModal.reason}
                    onChange={(e) =>
                      setDeactivationModal((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white h-24"
                    placeholder="Enter reason for deactivation..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Upload Resignation Letter *
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleResignationUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className={`border-slate-600 text-slate-300 ${
                          deactivationModal.resignationLetter
                            ? "border-green-500 text-green-400"
                            : ""
                        }`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {deactivationModal.resignationLetter
                          ? "Replace File"
                          : "Upload File"}
                      </Button>
                    </div>
                    {deactivationModal.resignationLetter && (
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>File uploaded ✓</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Date of Exit *</Label>
                  <Input
                    type="date"
                    value={deactivationModal.dateOfExit}
                    onChange={(e) =>
                      setDeactivationModal((prev) => ({
                        ...prev,
                        dateOfExit: e.target.value,
                      }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <span className="font-medium">⚠️ Important:</span>
                  </div>
                  <p className="text-yellow-300 text-sm mt-1">
                    Reason, resignation letter, and date of exit are mandatory
                    for employee deactivation.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleDeactivateEmployee}
                    disabled={
                      !deactivationModal.reason ||
                      !deactivationModal.resignationLetter ||
                      !deactivationModal.dateOfExit
                    }
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate Employee
                  </Button>
                  <Button
                    onClick={handleCloseDeactivationModal}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Detail Modal removed - now uses full page navigation */}
        {false && employeeDetailModal.employee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {(employeeDetailModal.isEditing
                      ? editPhotoPreview || employeeDetailModal.employee.photo
                      : employeeDetailModal.employee.photo) && (
                      <img
                        src={
                          employeeDetailModal.isEditing
                            ? editPhotoPreview ||
                              employeeDetailModal.employee.photo
                            : employeeDetailModal.employee.photo
                        }
                        alt={employeeDetailModal.employee.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                      />
                    )}
                    <div>
                      <CardTitle className="text-white text-xl">
                        {employeeDetailModal.isEditing
                          ? "Edit Employee"
                          : "Employee Details"}
                      </CardTitle>
                      <CardDescription className="text-slate-400 flex items-center space-x-2">
                        <span>
                          {employeeDetailModal.employee.fullName} -{" "}
                          {employeeDetailModal.employee.department}
                        </span>
                        {employeeDetailModal.employee.employeeId && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                          >
                            {employeeDetailModal.employee.employeeId}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
                      <Button
                        onClick={() =>
                          setEmployeeDetailModal((prev) => ({
                            ...prev,
                            activeTab: "details",
                            isEditing: false,
                          }))
                        }
                        variant={
                          employeeDetailModal.activeTab === "details"
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className={`${employeeDetailModal.activeTab === "details" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        onClick={() =>
                          setEmployeeDetailModal((prev) => ({
                            ...prev,
                            activeTab: "salary",
                            isEditing: false,
                          }))
                        }
                        variant={
                          employeeDetailModal.activeTab === "salary"
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className={`${employeeDetailModal.activeTab === "salary" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Salary
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {employeeDetailModal.activeTab === "details" && (
                        <>
                          {!employeeDetailModal.isEditing ? (
                            <Button
                              onClick={handleStartEdit}
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={handleSaveEmployee}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                className="border-slate-600 text-slate-300"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      <Button
                        onClick={handleCloseEmployeeDetail}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                {/* Photo Upload Section (Edit Mode Only) */}
                {employeeDetailModal.isEditing && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                      <Image className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Employee Photo
                      </h3>
                    </div>
                    <div className="flex items-center space-x-6">
                      {/* Current/New Photo Display */}
                      <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-800/30 overflow-hidden">
                        {editPhotoPreview ||
                        employeeDetailModal.employee.photo ? (
                          <img
                            src={
                              editPhotoPreview ||
                              employeeDetailModal.employee.photo
                            }
                            alt="Employee"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">No Photo</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Buttons */}
                      <div className="flex flex-col space-y-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {employeeDetailModal.employee.photo
                              ? "Change Photo"
                              : "Add Photo"}
                          </Button>
                        </div>

                        {(editPhotoPreview ||
                          employeeDetailModal.employee.photo) && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditPhotoPreview("");
                              handleEditFormChange("photo", "");
                            }}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <User className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">HR ID</Label>
                      <p className="text-slate-400 p-2 bg-slate-800/30 rounded border border-slate-700">
                        {employeeDetailModal.employee.employeeId || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.fullName ||
                            employeeDetailModal.employee.fullName
                          }
                          onChange={(e) =>
                            handleEditFormChange("fullName", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.fullName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Father's Name</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.fatherName ||
                            employeeDetailModal.employee.fatherName
                          }
                          onChange={(e) =>
                            handleEditFormChange("fatherName", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.fatherName || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Mother's Name</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.motherName ||
                            employeeDetailModal.employee.motherName
                          }
                          onChange={(e) =>
                            handleEditFormChange("motherName", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.motherName || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Birth Date</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          type="date"
                          value={
                            employeeDetailModal.editForm.birthDate ||
                            employeeDetailModal.employee.birthDate
                          }
                          onChange={(e) =>
                            handleEditFormChange("birthDate", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.birthDate || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Blood Group</Label>
                      {employeeDetailModal.isEditing ? (
                        <Select
                          value={
                            employeeDetailModal.editForm.bloodGroup ||
                            employeeDetailModal.employee.bloodGroup
                          }
                          onValueChange={(value) =>
                            handleEditFormChange("bloodGroup", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {bloodGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.bloodGroup || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          type="email"
                          value={
                            employeeDetailModal.editForm.email ||
                            employeeDetailModal.employee.email
                          }
                          onChange={(e) =>
                            handleEditFormChange("email", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Mobile Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.mobileNumber ||
                            employeeDetailModal.employee.mobileNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange("mobileNumber", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.mobileNumber}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Emergency Mobile</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm
                              .emergencyMobileNumber ||
                            employeeDetailModal.employee.emergencyMobileNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "emergencyMobileNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.emergencyMobileNumber ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Alternative Number
                      </Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm
                              .alternativeMobileNumber ||
                            employeeDetailModal.employee.alternativeMobileNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "alternativeMobileNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee
                            .alternativeMobileNumber || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Current Address</Label>
                      {employeeDetailModal.isEditing ? (
                        <Textarea
                          value={
                            employeeDetailModal.editForm.address ||
                            employeeDetailModal.employee.address
                          }
                          onChange={(e) =>
                            handleEditFormChange("address", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white h-20"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700 min-h-[80px]">
                          {employeeDetailModal.employee.address || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Permanent Address
                      </Label>
                      {employeeDetailModal.isEditing ? (
                        <Textarea
                          value={
                            employeeDetailModal.editForm.permanentAddress ||
                            employeeDetailModal.employee.permanentAddress
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "permanentAddress",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white h-20"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700 min-h-[80px]">
                          {employeeDetailModal.employee.permanentAddress ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <Briefcase className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Job Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Department</Label>
                      {employeeDetailModal.isEditing ? (
                        <Select
                          value={
                            employeeDetailModal.editForm.department ||
                            employeeDetailModal.employee.department
                          }
                          onValueChange={(value) =>
                            handleEditFormChange("department", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {departments.map((dept) => (
                              <SelectItem
                                key={dept._id || dept.id || dept.name}
                                value={dept.name}
                              >
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.department}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Position</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.position ||
                            employeeDetailModal.employee.position
                          }
                          onChange={(e) =>
                            handleEditFormChange("position", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.position || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Joining Date</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          type="date"
                          value={
                            employeeDetailModal.editForm.joiningDate ||
                            employeeDetailModal.employee.joiningDate
                          }
                          onChange={(e) =>
                            handleEditFormChange("joiningDate", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.joiningDate || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Table Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Select
                          value={
                            (employeeDetailModal.editForm
                              .tableNumber as string) ??
                            (employeeDetailModal.employee
                              .tableNumber as string) ??
                            ""
                          }
                          onValueChange={(val) =>
                            handleEditFormChange("tableNumber", val)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select table or location" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60 overflow-y-auto">
                            {/* Room/Location options */}
                            {["Room1", "Room2", "IT"].map((room) => {
                              const isRoomTaken = employees.some(
                                (e) =>
                                  e.status === "active" &&
                                  e.id !== employeeDetailModal.employee!.id &&
                                  e.tableNumber === room,
                              );
                              return (
                                <SelectItem
                                  key={room}
                                  value={room}
                                  disabled={isRoomTaken}
                                >
                                  {room}
                                  {isRoomTaken ? " (Assigned)" : ""}
                                </SelectItem>
                              );
                            })}
                            {/* Numeric table options (1-32) */}
                            {Array.from({ length: 32 }, (_, i) => i + 1)
                              .filter((n) => {
                                const taken = new Set(
                                  employees
                                    .filter(
                                      (e) =>
                                        e.status === "active" &&
                                        e.id !==
                                          employeeDetailModal.employee!.id &&
                                        e.tableNumber,
                                    )
                                    .map((e) => {
                                      const num = parseInt(e.tableNumber, 10);
                                      return !Number.isNaN(num) ? num : null;
                                    })
                                    .filter((x) => x !== null),
                                );
                                return !taken.has(n);
                              })
                              .map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  Table {n}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.tableNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Salary</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.salary ||
                            employeeDetailModal.employee.salary
                          }
                          onChange={(e) =>
                            handleEditFormChange("salary", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.salary || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            employeeDetailModal.employee.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {employeeDetailModal.employee.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <Landmark className="h-5 w-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Banking Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Account Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.accountNumber ||
                            employeeDetailModal.employee.accountNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "accountNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.accountNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">IFSC Code</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.ifscCode ||
                            employeeDetailModal.employee.ifscCode
                          }
                          onChange={(e) =>
                            handleEditFormChange("ifscCode", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.ifscCode || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Aadhaar Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.aadhaarNumber ||
                            employeeDetailModal.employee.aadhaarNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "aadhaarNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                          maxLength={14}
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.aadhaarNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">PAN Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.panNumber ||
                            employeeDetailModal.employee.panNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange("panNumber", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                          maxLength={10}
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.panNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">UAN Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.uanNumber ||
                            employeeDetailModal.employee.uanNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange("uanNumber", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.uanNumber || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Document Status
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentTypes.map((docType) => {
                      const hasDoc =
                        employeeDetailModal.employee[
                          docType.key as keyof Employee
                        ];
                      return (
                        <div
                          key={docType.key}
                          className="p-4 bg-slate-800/30 rounded border border-slate-700 space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <docType.icon className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-300 font-medium">
                              {docType.label}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ml-auto ${
                                hasDoc
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {hasDoc ? "✓" : "✗"}
                            </Badge>
                          </div>

                          {/* Edit Mode: Show upload/change options */}
                          {employeeDetailModal.isEditing && (
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="file"
                                  accept="image/*,.pdf,.doc,.docx"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        // Show loading toast
                                        const toastId = toast.loading(
                                          `Uploading ${docType.label}...`,
                                        );

                                        // Read file as base64
                                        const reader = new FileReader();
                                        reader.onload = async (event) => {
                                          const base64Data = event.target
                                            ?.result as string;
                                          try {
                                            // Upload to Supabase
                                            const supabaseUrl =
                                              await uploadBase64ToSupabase(
                                                base64Data,
                                                `documents/${employeeDetailModal.employee?.id}/${docType.key}`,
                                                file.name,
                                              );

                                            // Store URL instead of base64
                                            handleEditFormChange(
                                              docType.key,
                                              supabaseUrl,
                                            );

                                            // Update toast to success
                                            toast.success(
                                              `${docType.label} uploaded successfully!`,
                                              {
                                                id: toastId,
                                                description: `${file.name} - ${(file.size / 1024).toFixed(2)} KB`,
                                                duration: 3000,
                                              },
                                            );
                                          } catch (error) {
                                            toast.error(
                                              `Failed to upload ${docType.label}`,
                                              {
                                                id: toastId,
                                                description:
                                                  error instanceof Error
                                                    ? error.message
                                                    : "Unknown error",
                                                duration: 4000,
                                              },
                                            );
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      } catch (error) {
                                        toast.error(
                                          `Failed to upload ${docType.label}`,
                                          {
                                            description:
                                              error instanceof Error
                                                ? error.message
                                                : "Unknown error",
                                            duration: 4000,
                                          },
                                        );
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={`w-full text-xs ${
                                    hasDoc
                                      ? "border-blue-600 text-blue-400 hover:bg-blue-600/20"
                                      : "border-green-600 text-green-400 hover:bg-green-600/20"
                                  }`}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  {hasDoc ? "Change" : "Upload"}
                                </Button>
                              </div>
                              {hasDoc && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-red-600 text-red-400 hover:bg-red-600/20"
                                  onClick={() => {
                                    handleEditFormChange(docType.key, "");
                                    toast.success(`${docType.label} removed`, {
                                      duration: 2000,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}

                          {/* View Mode: Show preview button if document exists */}
                          {!employeeDetailModal.isEditing && hasDoc && (
                            <Button
                              onClick={() =>
                                handleOpenDocumentPreview(
                                  hasDoc as string,
                                  docType.label,
                                  employeeDetailModal.employee.fullName,
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="w-full text-xs border-blue-500 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deactivation Details (if applicable) */}
                {employeeDetailModal.employee.status === "inactive" &&
                  employeeDetailModal.employee.deactivationReason && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-red-700/30 pb-2">
                        <UserX className="h-5 w-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Deactivation Details
                        </h3>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                        <div>
                          <Label className="text-red-400 font-medium">
                            Reason:
                          </Label>
                          <p className="text-slate-300 mt-1">
                            {employeeDetailModal.employee.deactivationReason}
                          </p>
                        </div>
                        {employeeDetailModal.employee.deactivationDate && (
                          <div>
                            <Label className="text-red-400 font-medium">
                              Date:
                            </Label>
                            <p className="text-slate-300 mt-1">
                              {employeeDetailModal.employee.deactivationDate}
                            </p>
                          </div>
                        )}
                        {employeeDetailModal.employee.resignationLetter && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">
                                Resignation letter on file
                              </span>
                            </div>
                            <Button
                              onClick={() =>
                                handleOpenDocumentPreview(
                                  employeeDetailModal.employee
                                    .resignationLetter!,
                                  "Resignation Letter",
                                  employeeDetailModal.employee.fullName,
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs border-green-500 text-green-400 hover:bg-green-500/20"
                            >
                              <Image className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Salary Tab Content */}
                {employeeDetailModal.activeTab === "salary" && (
                  <div className="space-y-6">
                    {/* Add Salary Form */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Salary Management
                          </h3>
                        </div>
                        <Button
                          onClick={() => setShowSalaryForm(!showSalaryForm)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Salary Record
                        </Button>
                      </div>

                      {/* Salary Form */}
                      {showSalaryForm && (
                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <DollarSign className="h-5 w-5 text-green-400" />
                              <span>Add New Salary Record</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Month *
                                </Label>
                                <Input
                                  type="month"
                                  value={salaryForm.month}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      month: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Total Working Days *
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={salaryForm.totalWorkingDays}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      totalWorkingDays: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="26"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Actual Working Days *
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="31"
                                  value={salaryForm.actualWorkingDays}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      actualWorkingDays: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="25"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Basic Salary *
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salaryForm.basicSalary}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      basicSalary: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="50000"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Bonus (Optional)
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salaryForm.bonus}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      bonus: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="5000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Deductions (Optional)
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salaryForm.deductions}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      deductions: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="2000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Payment Date (Optional)
                                </Label>
                                <Input
                                  type="date"
                                  value={salaryForm.paymentDate}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      paymentDate: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-300">
                                Notes (Optional)
                              </Label>
                              <Textarea
                                value={salaryForm.notes}
                                onChange={(e) =>
                                  setSalaryForm({
                                    ...salaryForm,
                                    notes: e.target.value,
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700 text-white h-20"
                                placeholder="Any additional notes..."
                              />
                            </div>

                            {/* Calculated Total */}
                            {(salaryForm.basicSalary ||
                              salaryForm.bonus ||
                              salaryForm.deductions) && (
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-blue-400 font-medium">
                                    Total Salary:
                                  </span>
                                  <span className="text-white text-lg font-bold">
                                    ₹
                                    {(
                                      parseFloat(
                                        salaryForm.basicSalary || "0",
                                      ) +
                                      parseFloat(salaryForm.bonus || "0") -
                                      parseFloat(salaryForm.deductions || "0")
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                              <Button
                                onClick={handleAddSalaryRecord}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Add Record
                              </Button>
                              <Button
                                onClick={resetSalaryForm}
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Salary Records List */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Clock className="h-5 w-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Salary History
                        </h3>
                      </div>

                      {(() => {
                        const employeeSalaryRecords = getEmployeeSalaryRecords(
                          employeeDetailModal.employee.id,
                        );
                        return employeeSalaryRecords.length === 0 ? (
                          <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-white font-medium mb-2">
                              No Salary Records
                            </h4>
                            <p className="text-slate-400 mb-4">
                              No salary records found for this employee.
                            </p>
                            <Button
                              onClick={() => setShowSalaryForm(true)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Record
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {employeeSalaryRecords.map((record) => (
                              <Card
                                key={
                                  record._id ||
                                  record.id ||
                                  `${record.employeeId}-${record.month}`
                                }
                                className="bg-slate-800/30 border-slate-700"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      <div>
                                        <h4 className="text-white font-medium">
                                          {new Date(
                                            record.month + "-01",
                                          ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                          })}
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                          {record.actualWorkingDays}/
                                          {record.totalWorkingDays} working days
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <p className="text-white font-bold text-lg">
                                          ₹{record.totalSalary.toLocaleString()}
                                        </p>
                                        {record.paymentDate && (
                                          <p className="text-slate-400 text-sm">
                                            Paid: {record.paymentDate}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        onClick={() =>
                                          handleDeleteSalaryRecord(record.id)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-slate-400">
                                        Basic Salary
                                      </p>
                                      <p className="text-white font-medium">
                                        ₹{record.basicSalary.toLocaleString()}
                                      </p>
                                    </div>
                                    {record.bonus && record.bonus > 0 && (
                                      <div>
                                        <p className="text-slate-400">Bonus</p>
                                        <p className="text-green-400 font-medium">
                                          +₹{record.bonus.toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                    {record.deductions &&
                                      record.deductions > 0 && (
                                        <div>
                                          <p className="text-slate-400">
                                            Deductions
                                          </p>
                                          <p className="text-red-400 font-medium">
                                            -₹
                                            {record.deductions.toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                    <div>
                                      <p className="text-slate-400">Added On</p>
                                      <p className="text-white font-medium">
                                        {new Date(
                                          record.createdAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  {record.notes && (
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                      <p className="text-slate-400 text-sm">
                                        Notes:
                                      </p>
                                      <p className="text-slate-300 text-sm mt-1">
                                        {record.notes}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Preview Modal */}
        {documentPreviewModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <span>Document Preview</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {documentPreviewModal.documentType} -{" "}
                      {documentPreviewModal.employeeName}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCloseDocumentPreview}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center max-h-[70vh] overflow-auto">
                {documentPreviewModal.documentUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Check if it's an image */}
                    {documentPreviewModal.documentUrl.startsWith(
                      "data:image/",
                    ) ||
                    documentPreviewModal.documentUrl.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i,
                    ) ? (
                      <img
                        src={documentPreviewModal.documentUrl}
                        alt={documentPreviewModal.documentType}
                        className="max-w-full max-h-full object-contain rounded-lg border border-slate-600"
                      />
                    ) : documentPreviewModal.documentUrl.startsWith(
                        "data:application/pdf",
                      ) || documentPreviewModal.documentUrl.match(/\.pdf$/i) ? (
                      /* PDF Preview */
                      <div className="w-full h-full min-h-[500px] bg-slate-800/50 rounded-lg border border-slate-600 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <FileText className="h-16 w-16 text-slate-400 mx-auto" />
                          <div>
                            <p className="text-white font-medium mb-2">
                              PDF Document
                            </p>
                            <p className="text-slate-400 text-sm mb-4">
                              PDF preview not available in browser
                            </p>
                            <Button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = documentPreviewModal.documentUrl;
                                link.download = `${documentPreviewModal.documentType}_${documentPreviewModal.employeeName}.pdf`;
                                link.click();
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Other file types */
                      <div className="w-full h-full min-h-[300px] bg-slate-800/50 rounded-lg border border-slate-600 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <FileText className="h-16 w-16 text-slate-400 mx-auto" />
                          <div>
                            <p className="text-white font-medium mb-2">
                              Document File
                            </p>
                            <p className="text-slate-400 text-sm mb-4">
                              Preview not available for this file type
                            </p>
                            <Button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = documentPreviewModal.documentUrl;
                                link.download = `${documentPreviewModal.documentType}_${documentPreviewModal.employeeName}`;
                                link.click();
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Document Not Available
                    </h3>
                    <p className="text-slate-400">
                      The document file could not be loaded.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardContent className="border-t border-slate-700 p-4 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    <span className="font-medium text-slate-300">
                      Document Type:
                    </span>{" "}
                    {documentPreviewModal.documentType}
                  </div>
                  <div className="flex space-x-2">
                    {documentPreviewModal.documentUrl && (
                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = documentPreviewModal.documentUrl;
                          link.download = `${documentPreviewModal.documentType}_${documentPreviewModal.employeeName}`;
                          link.click();
                        }}
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={handleCloseDocumentPreview}
                      className="bg-slate-600 hover:bg-slate-700 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        autoClose={3000}
      />

      {/* Image Cropper Modal */}
      <ImageCropper
        image={imageToCrop}
        open={showImageCropper}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  );
}
