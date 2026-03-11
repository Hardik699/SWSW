import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  User,
  ArrowLeft,
  Edit,
  Save,
  X,
  Upload,
  Trash2,
  Eye,
  DollarSign,
  Plus,
  Image,
  FileText,
  CreditCard,
  Landmark,
  Briefcase,
  CalendarDays,
  UserX,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFileToSupabase, uploadBase64ToSupabase } from "@/lib/supabase";
import {
  SalarySlip
} from "@/components/SalarySlip";
import { convertNumberToWords } from "@/lib/utils";
import AppNav from "@/components/Navigation";
import SuccessModal from "@/components/SuccessModal";
import { ImageCropper } from "@/components/ImageCropper";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Helper function to convert numbers to words
const numberToWords = (num: number): string => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  if (num === 0) return "Zero";

  const parts: string[] = [];
  let scaleIndex = 0;

  while (num > 0 && scaleIndex < scales.length) {
    let divisor = scaleIndex === 0 ? 1000 : (scaleIndex === 1 ? 100 : 100);
    let groupValue = num % (scaleIndex === 0 ? 1000 : 1000000);

    if (scaleIndex === 0) {
      groupValue = num % 1000;
    } else if (scaleIndex === 1) {
      groupValue = Math.floor((num % 100000) / 1000);
    } else if (scaleIndex === 2) {
      groupValue = Math.floor((num % 10000000) / 100000);
    } else {
      groupValue = Math.floor(num / 10000000);
    }

    if (groupValue > 0) {
      let groupText = "";
      const hundreds = Math.floor(groupValue / 100);
      const remainder = groupValue % 100;

      if (hundreds > 0) {
        groupText += ones[hundreds] + " Hundred";
      }

      if (remainder >= 20) {
        if (hundreds > 0) groupText += " ";
        groupText += tens[Math.floor(remainder / 10)];
        if (remainder % 10 > 0) {
          groupText += " " + ones[remainder % 10];
        }
      } else if (remainder >= 10) {
        if (hundreds > 0) groupText += " ";
        groupText += teens[remainder - 10];
      } else if (remainder > 0) {
        if (hundreds > 0) groupText += " ";
        groupText += ones[remainder];
      }

      if (scales[scaleIndex]) {
        groupText += " " + scales[scaleIndex];
      }

      parts.unshift(groupText);
    }

    num = Math.floor(num / (scaleIndex === 0 ? 1000 : 100000));
    scaleIndex++;
  }

  return parts.join(" ");
};

// Helper function to generate payslip PDF
const generatePayslipPDF = async (employee: Employee, record: any) => {
  const element = document.createElement("div");
  const monthName = new Date(record.month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const joiningDate = new Date(employee.joiningDate).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });

  element.innerHTML = `
    <div style="width: 900px; padding: 40px; font-family: Arial, sans-serif; background: white; color: #000; min-height: 100vh;">

      <!-- Company Header -->
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
        <h1 style="margin: 0; font-size: 18px; font-weight: bold;">INFOSEUM IT OPC PVT LTD.</h1>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Imperial Heights -701, Near Akshar Chowk, Atladra, Vadodara-390012 Gujarat</p>
      </div>

      <!-- Pay Slip Title -->
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 10px 0; font-size: 14px; font-weight: bold;">Pay Check - ${monthName}</h2>
      </div>

      <!-- Employee Info Section -->
      <table style="width: 100%; border: 2px solid #000; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border: 1px solid #000;">
          <td style="border: 1px solid #000; padding: 8px; font-weight: bold; width: 50%;">
            <div>Name: ${employee.fullName}</div>
            <div>Department: ${employee.department}</div>
            <div>Designation: ${employee.position}</div>
            <div>Date Of Joining: ${joiningDate}</div>
            <div>Employee Code: ${employee.employeeId}</div>
          </td>
          <td style="border: 1px solid #000; padding: 8px; font-weight: bold; width: 50%;">
            <div>UAN No.: ${employee.uanNumber}</div>
            <div>ESIC No.: ${employee.esic ? employee.esic : "N/A"}</div>
            <div>Bank A/C No.: ${employee.accountNumber}</div>
            <div>Days In Month: ${record.totalWorkingDays}</div>
          </td>
        </tr>
      </table>

      <!-- Leave Details Section -->
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border: 2px solid #000; border-collapse: collapse;">
          <tr style="border: 1px solid #000; font-weight: bold;">
            <td colspan="5" style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Leave Details</td>
          </tr>
          <tr style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">Leave Type</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">Total Leave In The Account</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">Leave Availed</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">Subsisting Leave</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">LWP</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">PL</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.plTotal || 0.0}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.plAvailed || 0.0}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(record.plTotal || 0) - (record.plAvailed || 0)}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.plLwp || 0.0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">CL</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.clTotal || 0.0}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.clAvailed || 0.0}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(record.clTotal || 0) - (record.clAvailed || 0)}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.clLwp || 0.0}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">SL</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.slTotal || 0.0}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.slAvailed || 0.0}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(record.slTotal || 0) - (record.slAvailed || 0)}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.slLwp || 0.0}</td>
          </tr>
          <tr style="border: 1px solid #000; font-weight: bold;">
            <td style="border: 1px solid #000; padding: 8px;">Total Leaves Taken -</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(record.plAvailed || 0) + (record.clAvailed || 0) + (record.slAvailed || 0)}</td>
            <td colspan="2" style="border: 1px solid #000; padding: 8px;">Total Leave Without Pay -</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.lwp || 0.0}</td>
          </tr>
          <tr style="border: 1px solid #000; font-weight: bold;">
            <td style="border: 1px solid #000; padding: 8px;">Total Present Days -</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.actualWorkingDays}</td>
            <td colspan="2" style="border: 1px solid #000; padding: 8px;">Total Days Payable -</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${record.actualWorkingDays}</td>
          </tr>
        </table>
      </div>

      <!-- Salary Details Section -->
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border: 2px solid #000; border-collapse: collapse;">
          <tr style="border: 1px solid #000; font-weight: bold;">
            <td colspan="4" style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Salary Details</td>
          </tr>
          <tr style="border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;">
            <td style="border: 1px solid #000; padding: 8px; width: 25%;">Earning</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right; width: 25%;">Actual Gross</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right; width: 25%;">Earned Gross</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right; width: 25%;">Deduction</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Basic</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.basic || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.basicEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>PF</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">HRA</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.hra || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.hraEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.pf || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Conveyance</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.conveyance || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.conveyanceEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>ESIC</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Sp. Allowance</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.specialAllowance || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.specialAllowanceEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.esic || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Incentive</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.incentive || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.incentiveEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>PT</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Adjustment</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.adjustment || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.adjustmentEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.pt || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Bonus</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.bonus || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.bonusEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>TDS</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Retention Bonus</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.retentionBonus || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.retentionBonusEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>${employee.retentionType || "Retention"}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px;">Advance Any</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.advanceAny || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${(record.advanceAnyEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>Advance Any</strong></td>
          </tr>
          <tr style="border: 1px solid #000; font-weight: bold;">
            <td style="border: 1px solid #000; padding: 8px;">Gross Earnings</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${((record.basic || 0) + (record.hra || 0) + (record.conveyance || 0) + (record.specialAllowance || 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${((record.basicEarned || 0) + (record.hraEarned || 0) + (record.conveyanceEarned || 0) + (record.specialAllowanceEarned || 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"><strong>Gross Deduction</strong></td>
          </tr>
          <tr style="border: 1px solid #000;">
            <td style="border: 1px solid #000; padding: 8px;"></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${((record.pf || 0) + (record.esic || 0) + (record.pt || 0) + (record.tds || 0) + (record.advanceAnyDeduction || 0) + (record.retention || 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          </tr>
          <tr style="border: 1px solid #000; font-weight: bold;">
            <td style="border: 1px solid #000; padding: 8px;">Net Salary Credited-</td>
            <td colspan="2" style="border: 1px solid #000; padding: 8px;"></td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">₹ ${record.totalSalary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
          </tr>
          <tr style="border: 1px solid #000;">
            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Amount (in words) -</td>
            <td colspan="3" style="border: 1px solid #000; padding: 8px; text-align: right;">${numberToWords(Math.floor(record.totalSalary))} Rupees only</td>
          </tr>
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px;">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Ctext x='10' y='30' font-size='12' font-weight='bold'%3EInfoseum%3C/text%3E%3C/svg%3E" style="height: 30px; margin: 10px 0;" />
        <p style="margin: 15px 0 0 0; font-size: 11px; color: #666;">This is a system generated slip</p>
      </div>
    </div>
  `;

  try {
    // Append element to body so html2canvas can access it
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.top = "-9999px";
    document.body.appendChild(element);

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    // Remove element from DOM
    document.body.removeChild(element);

    // Composite a white background under the captured canvas to avoid transparency
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const fctx = finalCanvas.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#ffffff';
      fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      fctx.drawImage(canvas, 0, 0);
    }

    const imgData = finalCanvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `payslip-${employee.fullName.replace(/\s+/g, "_")}-${record.month}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Clean up in case of error
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    throw error;
  }
};

interface Employee {
  id: string;
  employeeId: string;
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
  joiningDate: string;
  department: string;
  position: string;
  tableNumber: string;
  accountNumber: string;
  ifscCode: string;
  bankPassbook?: string;
  aadhaarNumber: string;
  panNumber: string;
  uanNumber: string;
  uanSkipReason?: string;
  salary: string;
  aadhaarCard?: string;
  panCard?: string;
  passport?: string;
  drivingLicense?: string;
  resume?: string;
  medicalCertificate?: string;
  educationCertificate?: string;
  experienceLetter?: string;
  status: "active" | "inactive";
  deactivationReason?: string;
  resignationLetter?: string;
  deactivationDate?: string;
  pf?: string;
  employerPf?: string;
  esic?: string;
  pt?: string;
  tds?: string;
  advanceAny?: string;
  retention?: string;
  retentionType?: "Retention" | "Deduction";
}

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
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

interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
}

const documentTypes = [
  { key: "aadhaarCard", label: "Aadhaar Card", icon: CreditCard },
  { key: "panCard", label: "PAN Card", icon: CreditCard },
  { key: "passport", label: "Passport", icon: FileText },
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

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"details" | "salary">("details");
  const [selectedSalarySlip, setSelectedSalarySlip] = useState<SalaryRecord | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [editingSalaryRecordId, setEditingSalaryRecordId] = useState<string | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    month: "",
    totalWorkingDays: "",
    actualWorkingDays: "",
    // Earnings
    basic: "",
    hra: "",
    conveyance: "",
    specialAllowance: "",
    incentive: "",
    adjustment: "",
    bonus: "",
    retentionBonus: "",
    advanceAny: "",
    // Earned Gross
    basicEarned: "",
    hraEarned: "",
    conveyanceEarned: "",
    specialAllowanceEarned: "",
    incentiveEarned: "",
    adjustmentEarned: "",
    bonusEarned: "",
    retentionBonusEarned: "",
    advanceAnyEarned: "",
    // Deductions
    pf: "",
    esic: "",
    pt: "",
    tds: "",
    advanceAnyDeduction: "",
    retention: "",
    // Other
    paymentDate: "",
    notes: "",
    // Leave Details
    plTotal: "",
    plAvailed: "",
    plSubsisting: "",
    plLwp: "",
    clTotal: "",
    clAvailed: "",
    clSubsisting: "",
    clLwp: "",
    slTotal: "",
    slAvailed: "",
    slSubsisting: "",
    slLwp: "",
    totalLeavesTaken: "",
    totalLeaveWithoutPay: "",
    totalWorkingDaysPayable: "",
  });
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

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
  }>({
    isOpen: false,
    title: "Success!",
    message: "Data saved successfully!",
  });

  // Helper function to auto-calculate salary components
  const calculateSalaryComponents = (basicSalary: number) => {
    if (basicSalary <= 0) return { hra: 0, conveyance: 1600, actualBasic: 0, specialAllowance: 0 };

    // Actual Basic for Gross calculation = Basic Salary * 50%
    const actualBasic = basicSalary * 0.5;

    // HRA = Actual Basic * 40%, with minimum of 1600
    const calculatedHra = actualBasic * 0.4;
    const hra = Math.max(calculatedHra, 1600);

    // Conveyance = fixed 1600
    const conveyance = 1600;

    // Special Allowance = Actual Basic - HRA - Conveyance
    const specialAllowance = actualBasic - hra - conveyance;

    return {
      hra: Math.round(hra * 100) / 100,
      conveyance,
      actualBasic: Math.round(actualBasic * 100) / 100,
      specialAllowance: Math.round(specialAllowance * 100) / 100,
    };
  };

  // Helper function to calculate earned values based on actual values and working days
  const calculateEarnedValues = (salaryFormData: typeof salaryForm) => {
    const totalWorkingDays = parseFloat(salaryFormData.totalWorkingDays) || 0;
    const actualWorkingDays = parseFloat(salaryFormData.actualWorkingDays) || 0;

    if (totalWorkingDays <= 0 || actualWorkingDays <= 0) {
      return {
        basicEarned: "0",
        hraEarned: "0",
        conveyanceEarned: "0",
        specialAllowanceEarned: "0",
        incentiveEarned: "0",
        adjustmentEarned: "0",
        bonusEarned: "0",
        retentionBonusEarned: "0",
        advanceAnyEarned: "0",
      };
    }

    const actualFields: (keyof typeof salaryForm)[] = [
      "basic", "hra", "conveyance", "specialAllowance",
      "incentive", "adjustment", "bonus", "retentionBonus", "advanceAny"
    ];

    const earnedMap: Record<string, number> = {};

    actualFields.forEach((field) => {
      let actualValue = parseFloat(salaryFormData[field] as string) || 0;

      // For Basic field, use Actual Gross (50% of basic)
      if (field === "basic") {
        actualValue = actualValue * 0.5;
      }

      const earnedValue = (actualValue / totalWorkingDays) * actualWorkingDays;
      const earnedKey = field === "basic" ? "basicEarned" :
                        field === "hra" ? "hraEarned" :
                        field === "conveyance" ? "conveyanceEarned" :
                        field === "specialAllowance" ? "specialAllowanceEarned" :
                        field === "incentive" ? "incentiveEarned" :
                        field === "adjustment" ? "adjustmentEarned" :
                        field === "bonus" ? "bonusEarned" :
                        field === "retentionBonus" ? "retentionBonusEarned" : "advanceAnyEarned";
      earnedMap[earnedKey] = Math.round(earnedValue * 100) / 100;
    });

    return {
      basicEarned: earnedMap.basicEarned?.toString() || "0",
      hraEarned: earnedMap.hraEarned?.toString() || "0",
      conveyanceEarned: earnedMap.conveyanceEarned?.toString() || "0",
      specialAllowanceEarned: earnedMap.specialAllowanceEarned?.toString() || "0",
      incentiveEarned: earnedMap.incentiveEarned?.toString() || "0",
      adjustmentEarned: earnedMap.adjustmentEarned?.toString() || "0",
      bonusEarned: earnedMap.bonusEarned?.toString() || "0",
      retentionBonusEarned: earnedMap.retentionBonusEarned?.toString() || "0",
      advanceAnyEarned: earnedMap.advanceAnyEarned?.toString() || "0",
    };
  };

  useEffect(() => {
    const loadData = async () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const role = localStorage.getItem("userRole");

      if (!isAuthenticated || (role !== "admin" && role !== "hr")) {
        navigate("/login");
        return;
      }

      try {
        // Load employee data from API with fallback error handling
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
          fetch("/api/salary-records").catch((err) => {
            console.error("Failed to fetch salary records:", err);
            return new Response(JSON.stringify({ success: false, data: [] }), {
              status: 500,
            });
          }),
          fetch("/api/leave-records").catch((err) => {
            console.error("Failed to fetch leave records:", err);
            return new Response(JSON.stringify({ success: false, data: [] }), {
              status: 500,
            });
          }),
        ];

        const [empRes, deptRes, salaryRes, leaveRes] = await Promise.all(requests);

        let employees: Employee[] = [];
        let dept: Department[] = [];
        let salary: SalaryRecord[] = [];
        let leave: any[] = [];

        if (empRes.ok) {
          try {
            const empData = await empRes.json();
            if (empData.success && empData.data) {
              // Normalize employees: map _id to id
              employees = empData.data.map((emp: any) => ({
                ...emp,
                id: emp._id || emp.id,
              }));
            }
          } catch (e) {
            console.error("Failed to parse employees response. This often happens if the connection is lost during body read or if the response is not valid JSON.", e);
          }
        }
        if (deptRes.ok) {
          try {
            const deptData = await deptRes.json();
            if (deptData.success && deptData.data) {
              // Normalize departments: map _id to id
              dept = deptData.data.map((d: any) => ({
                ...d,
                id: d._id || d.id,
              }));
            }
          } catch (e) {
            console.error("Failed to parse departments response:", e);
          }
        }
        if (salaryRes.ok) {
          try {
            const salaryData = await salaryRes.json();
            if (salaryData.success && salaryData.data) {
              // Normalize salary records: keep _id and map to id for compatibility
              salary = salaryData.data.map((s: any) => ({
                ...s,
                _id: s._id, // Keep original MongoDB _id
                id: s._id || s.id, // Also set id field
              }));
            }
          } catch (e) {
            console.error("Failed to parse salary records response:", e);
          }
        }
        if (leaveRes.ok) {
          try {
            const leaveData = await leaveRes.json();
            if (leaveData.success && leaveData.data) {
              // Normalize leave records: keep _id and map to id for compatibility
              leave = leaveData.data.map((l: any) => ({
                ...l,
                _id: l._id, // Keep original MongoDB _id
                id: l._id || l.id, // Also set id field
              }));
            }
          } catch (e) {
            console.error("Failed to parse leave records response:", e);
          }
        }

        setAllEmployees(employees);
        setDepartments(dept);
        setSalaryRecords(salary);
        setLeaveRecords(leave);

        if (employeeId) {
          const found = employees.find(
            (e) => e.id === employeeId || e._id === employeeId,
          );
          if (found) {
            setEmployee(found);
            console.log("Employee loaded:", found);
          } else {
            console.warn("Employee not found with ID:", employeeId);
            toast.error("❌ Employee Not Found", {
              description:
                "This employee record could not be found in the system.",
            });
            navigate("/hr");
          }
        }
      } catch (error) {
        console.error("Failed to load employee details:", error);
      }
    };

    loadData();
  }, [employeeId, navigate]);

  const handleStartEdit = () => {
    if (employee) {
      setIsEditing(true);
      setEditForm({ ...employee });
      setEditPhotoPreview(employee.photo || "");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    setEditPhotoPreview("");
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToCrop(result);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setEditPhotoPreview(croppedImage);
    handleEditFormChange("photo", croppedImage);
    setShowImageCropper(false);
    setImageToCrop("");
    toast.success("Photo cropped successfully!");
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop("");
  };

  const handleEditDocumentUpload =
    (docKey: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          console.log(`Uploading ${docKey}, file:`, file.name, file.size, file.type);
          
          // Check file size (max 5MB for database storage)
          if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large", {
              description: "Please upload a file smaller than 5MB",
            });
            return;
          }
          
          toast.loading(`Uploading ${docKey}...`);
          
          // Convert file to base64 and save directly in database
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            console.log(`Converted ${docKey} to base64, length:`, base64Data.length);
            
            toast.dismiss();
            handleEditFormChange(docKey, base64Data);
            toast.success("📄 Document Uploaded!", {
              description: "Document has been successfully uploaded.",
            });
          };
          
          reader.onerror = (error) => {
            toast.dismiss();
            console.error(`Error reading ${docKey}:`, error);
            toast.error(`Failed to upload ${docKey}`, {
              description: "Error reading file",
            });
          };
          
          reader.readAsDataURL(file);
          
        } catch (error) {
          toast.dismiss();
          console.error(`Error uploading ${docKey}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to upload ${docKey}`, {
            description: errorMessage,
          });
        }
      }
    };

  const handleSaveEmployee = async () => {
    if (!employee) return;

    const pendingTable =
      (editForm.tableNumber as string) ?? employee.tableNumber;
    if (pendingTable) {
      const n = parseInt(pendingTable, 10);
      const taken = new Set(
        allEmployees
          .filter(
            (e) =>
              e.status === "active" && e.id !== employee.id && e.tableNumber,
          )
          .map((e) => parseInt(e.tableNumber, 10))
          .filter((x) => !Number.isNaN(x)),
      );
      if (Number.isNaN(n) || n < 1 || n > 32 || taken.has(n)) {
        alert(
          "Selected table number is invalid or already assigned to an active employee",
        );
        return;
      }
    }

    try {
      const updatedEmployee = { ...employee, ...editForm };

      // Save to API
      if (employee._id) {
        await fetch(`/api/employees/${employee._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEmployee),
        });
      }

      setEmployee(updatedEmployee);
      setIsEditing(false);
      setEditForm({});
      setSuccessModal({
        isOpen: true,
        title: "✅ Employee Updated!",
        message: `${employee.fullName}'s information has been successfully saved.`,
      });
    } catch (error) {
      console.error("Failed to save employee:", error);
      toast.error("Failed to save employee information");
    }
  };


  const handleAddSalaryRecord = async () => {
    if (!employee || !salaryForm.month) {
      alert("Please fill in required fields");
      return;
    }

    // Calculate totals using EARNED values (based on actual working days)
    const basicEarned =
      (parseFloat(salaryForm.basicEarned) || 0) +
      (parseFloat(salaryForm.hraEarned) || 0) +
      (parseFloat(salaryForm.conveyanceEarned) || 0) +
      (parseFloat(salaryForm.specialAllowanceEarned) || 0) +
      (parseFloat(salaryForm.incentiveEarned) || 0) +
      (parseFloat(salaryForm.adjustmentEarned) || 0) +
      (parseFloat(salaryForm.retentionBonusEarned) || 0) -
      (parseFloat(salaryForm.advanceAnyEarned) || 0);

    const bonusEarned = parseFloat(salaryForm.bonusEarned) || 0;

    // Use deduction values from employee's personal information (not from form)
    const pf = parseFloat(employee?.pf || "0") || 0;
    const esic = parseFloat(employee?.esic || "0") || 0;
    const pt = parseFloat(employee?.pt || "0") || 0;
    const tds = parseFloat(employee?.tds || "0") || 0;
    const advanceAnyDeduction = parseFloat(employee?.advanceAny || "0") || 0;
    const retention = parseFloat(employee?.retention || "0") || 0;

    const totalDeductions = pf + esic + pt + tds + advanceAnyDeduction + retention;

    const totalSalary = basicEarned + bonusEarned - totalDeductions;

    const newRecord: any = {
      id: editingSalaryRecordId || Date.now().toString(),
      employeeId: employee.id,
      month: salaryForm.month,
      year: parseInt(salaryForm.month.split("-")[0]),
      totalWorkingDays: parseInt(salaryForm.totalWorkingDays) || 0,
      actualWorkingDays: parseInt(salaryForm.actualWorkingDays) || 0,
      basicSalary: basicEarned,
      bonus: bonusEarned,
      deductions: totalDeductions,
      totalSalary: totalSalary,
      paymentDate: salaryForm.paymentDate || undefined,
      notes: salaryForm.notes || undefined,
      createdAt: new Date().toISOString(),
      // Individual Earnings (Actual)
      basic: parseFloat(salaryForm.basic) || 0,
      hra: parseFloat(salaryForm.hra) || 0,
      conveyance: parseFloat(salaryForm.conveyance) || 0,
      specialAllowance: parseFloat(salaryForm.specialAllowance) || 0,
      incentive: parseFloat(salaryForm.incentive) || 0,
      adjustment: parseFloat(salaryForm.adjustment) || 0,
      // Individual Earnings (Earned based on working days)
      basicEarned: parseFloat(salaryForm.basicEarned) || 0,
      hraEarned: parseFloat(salaryForm.hraEarned) || 0,
      conveyanceEarned: parseFloat(salaryForm.conveyanceEarned) || 0,
      specialAllowanceEarned: parseFloat(salaryForm.specialAllowanceEarned) || 0,
      incentiveEarned: parseFloat(salaryForm.incentiveEarned) || 0,
      adjustmentEarned: parseFloat(salaryForm.adjustmentEarned) || 0,
      bonusEarned: parseFloat(salaryForm.bonusEarned) || 0,
      retentionBonusEarned: parseFloat(salaryForm.retentionBonusEarned) || 0,
      advanceAnyEarned: parseFloat(salaryForm.advanceAnyEarned) || 0,
      // Individual Deductions (from employee personal info)
      pf: pf,
      esic: esic,
      pt: pt,
      tds: tds,
      advanceAnyDeduction: advanceAnyDeduction,
      retention: retention,
      // Leave Details
      plTotal: parseFloat(salaryForm.plTotal) || 0,
      plAvailed: parseFloat(salaryForm.plAvailed) || 0,
      plSubsisting: parseFloat(salaryForm.plSubsisting) || 0,
      clTotal: parseFloat(salaryForm.clTotal) || 0,
      clAvailed: parseFloat(salaryForm.clAvailed) || 0,
      clSubsisting: parseFloat(salaryForm.clSubsisting) || 0,
      slTotal: parseFloat(salaryForm.slTotal) || 0,
      slAvailed: parseFloat(salaryForm.slAvailed) || 0,
      slSubsisting: parseFloat(salaryForm.slSubsisting) || 0,
      plLwp: parseFloat(salaryForm.plLwp) || 0,
      clLwp: parseFloat(salaryForm.clLwp) || 0,
      slLwp: parseFloat(salaryForm.slLwp) || 0,
      lwp: (parseFloat(salaryForm.plLwp) || 0) + (parseFloat(salaryForm.clLwp) || 0) + (parseFloat(salaryForm.slLwp) || 0),
    };

    console.log('=== SAVING SALARY RECORD ===');
    console.log('Form data:', salaryForm);
    console.log('Leave values being saved:', {
      PL: { total: salaryForm.plTotal, availed: salaryForm.plAvailed, subsisting: salaryForm.plSubsisting, lwp: salaryForm.plLwp },
      CL: { total: salaryForm.clTotal, availed: salaryForm.clAvailed, subsisting: salaryForm.clSubsisting, lwp: salaryForm.clLwp },
      SL: { total: salaryForm.slTotal, availed: salaryForm.slAvailed, subsisting: salaryForm.slSubsisting, lwp: salaryForm.slLwp },
      totalLwp: newRecord.lwp
    });
    console.log('Complete newRecord object:', newRecord);
    console.log('LWP values in newRecord:', {
      plLwp: newRecord.plLwp,
      clLwp: newRecord.clLwp,
      slLwp: newRecord.slLwp,
      totalLwp: newRecord.lwp
    });

    try {
      // Determine if we're creating or updating
      const isUpdating = editingSalaryRecordId !== null;
      const method = isUpdating ? "PUT" : "POST";
      const url = isUpdating
        ? `/api/salary-records/${editingSalaryRecordId}`
        : "/api/salary-records";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate record error
        if (errorData.isDuplicate) {
          const existingRecord = salaryRecords.find(
            (record) => record.employeeId === employee.id && record.month === salaryForm.month
          );

          if (existingRecord && confirm(
            "A salary record already exists for this month. Click OK to update the existing record."
          )) {
            // Update existing record
            const mongoId = (existingRecord as any)._id || existingRecord.id;
            const updateResponse = await fetch(`/api/salary-records/${mongoId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newRecord),
            });

            if (!updateResponse.ok) {
              const updateError = await updateResponse.json();
              throw new Error(updateError.error || "Failed to update salary record");
            }

            const updatedData = await updateResponse.json();
            const updatedRecord = {
              ...updatedData.data,
              _id: updatedData.data._id, // Keep MongoDB _id
              id: updatedData.data._id || updatedData.data.id,
            };

            const updatedRecords = salaryRecords.map((record) =>
              record.id === existingRecord.id ? updatedRecord : record
            );
            setSalaryRecords(updatedRecords);

            toast.success("✨ Salary Record Updated!", {
              description: `Salary record for ${salaryForm.month} has been updated successfully.`,
            });
          } else {
            toast.error("Record Already Exists", {
              description: errorData.error || "A record for this month already exists.",
            });
          }
          return;
        }

        throw new Error(errorData.error || "Failed to create salary record");
      }

      const responseData = await response.json();
      const savedRecord = {
        ...responseData.data,
        _id: responseData.data._id, // Keep MongoDB _id
        id: responseData.data._id || responseData.data.id,
      };

      console.log('=== SAVE SUCCESSFUL ===');
      console.log('Saved record from server:', savedRecord);
      console.log('Leave data in saved record:', {
        PL: { total: savedRecord.plTotal, availed: savedRecord.plAvailed, subsisting: savedRecord.plSubsisting, lwp: savedRecord.plLwp },
        CL: { total: savedRecord.clTotal, availed: savedRecord.clAvailed, subsisting: savedRecord.clSubsisting, lwp: savedRecord.clLwp },
        SL: { total: savedRecord.slTotal, availed: savedRecord.slAvailed, subsisting: savedRecord.slSubsisting, lwp: savedRecord.slLwp },
        totalLwp: savedRecord.lwp
      });
      console.log('Record will be added to salaryRecords state');
      console.log('Current salaryRecords count:', salaryRecords.length);

      if (isUpdating) {
        // Update existing record in state
        const updatedRecords = salaryRecords.map((record) =>
          record.id === editingSalaryRecordId ? savedRecord : record
        );
        setSalaryRecords(updatedRecords);
        toast.success("✨ Salary Record Updated!", {
          description: `Salary record for ${salaryForm.month} has been updated successfully.`,
        });
      } else {
        // Add new record
        setSalaryRecords([...salaryRecords, savedRecord]);
        toast.success("✨ Salary Record Created!", {
          description: `Salary record for ${salaryForm.month} has been added successfully.`,
        });
      }

      setSalaryForm({
        month: "",
        totalWorkingDays: "",
        actualWorkingDays: "",
        basic: "",
        hra: "",
        conveyance: "",
        specialAllowance: "",
        incentive: "",
        adjustment: "",
        bonus: "",
        retentionBonus: "",
        advanceAny: "",
        basicEarned: "",
        hraEarned: "",
        conveyanceEarned: "",
        specialAllowanceEarned: "",
        incentiveEarned: "",
        adjustmentEarned: "",
        bonusEarned: "",
        retentionBonusEarned: "",
        advanceAnyEarned: "",
        pf: "",
        esic: "",
        pt: "",
        tds: "",
        advanceAnyDeduction: "",
        retention: "",
        paymentDate: "",
        notes: "",
        plTotal: "",
        plAvailed: "",
        plSubsisting: "",
        plLwp: "",
        clTotal: "",
        clAvailed: "",
        clSubsisting: "",
        clLwp: "",
        slTotal: "",
        slAvailed: "",
        slSubsisting: "",
        slLwp: "",
        totalLeavesTaken: "",
        totalLeaveWithoutPay: "",
        totalWorkingDaysPayable: "",
      });
      setEditingSalaryRecordId(null);
      setShowSalaryForm(false);
    } catch (error) {
      console.error("Failed to save salary record:", error);
      toast.error("Failed to save salary record", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleDeleteSalaryRecord = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this salary record?")) {
      try {
        // Find the record to get the MongoDB _id
        const record = salaryRecords.find((r) => r.id === recordId);
        if (!record) {
          throw new Error("Record not found in local data");
        }

        const mongoId = (record as any)._id || recordId;
        console.log("Deleting salary record with ID:", mongoId);

        const response = await fetch(`/api/salary-records/${mongoId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          let errorMessage = "Failed to delete salary record";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON, use the status text
            errorMessage = `${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const updatedRecords = salaryRecords.filter(
          (record) => record.id !== recordId,
        );
        setSalaryRecords(updatedRecords);
        toast.success("✨ Salary Record Deleted!", {
          description: "The salary record has been removed successfully.",
        });
      } catch (error) {
        console.error("Failed to delete salary record:", error);
        toast.error("Failed to delete salary record", {
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
  };

  const handleDownloadPayslip = async (record: SalaryRecord) => {
    if (!employee) {
      toast.error("Employee data not available");
      return;
    }
    try {
      await generatePayslipPDF(employee, record);
      toast.success("✨ Payslip Downloaded!", {
        description: "Your salary slip has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Failed to download payslip:", error);
      toast.error("Failed to download payslip", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const initializeNewSalaryForm = () => {
    const salary = parseFloat(employee?.salary || "0");
    const employerPf = parseFloat(employee?.employerPf || "0");
    const esic = parseFloat(employee?.esic || "0");
    const basicAmount = salary - employerPf - esic;

    // Auto-calculate dependent values
    const calculations = calculateSalaryComponents(basicAmount);

    const newForm = {
      month: "",
      totalWorkingDays: "",
      actualWorkingDays: "",
      basic: basicAmount.toString(),
      hra: calculations.hra.toString(),
      conveyance: calculations.conveyance.toString(),
      specialAllowance: calculations.specialAllowance.toString(),
      incentive: "",
      adjustment: "",
      bonus: "",
      retentionBonus: "",
      advanceAny: "",
      basicEarned: "",
      hraEarned: "",
      conveyanceEarned: "",
      specialAllowanceEarned: "",
      incentiveEarned: "",
      adjustmentEarned: "",
      bonusEarned: "",
      retentionBonusEarned: "",
      advanceAnyEarned: "",
      pf: employee?.pf || "",
      esic: employee?.esic || "",
      pt: employee?.pt || "",
      tds: employee?.tds || "",
      advanceAnyDeduction: employee?.advanceAny || "",
      retention: employee?.retention || "",
      paymentDate: "",
      notes: "",
      // Leave Details
      plTotal: "",
      plAvailed: "",
      plSubsisting: "",
      plLwp: "",
      clTotal: "",
      clAvailed: "",
      clSubsisting: "",
      clLwp: "",
      slTotal: "",
      slAvailed: "",
      slSubsisting: "",
      slLwp: "",
      totalLeavesTaken: "",
      totalLeaveWithoutPay: "",
      totalWorkingDaysPayable: "",
    };

    const earnedValues = calculateEarnedValues(newForm);
    setSalaryForm({
      ...newForm,
      ...earnedValues,
    });
  };

  const handleEditSalaryRecord = (record: SalaryRecord) => {
    setEditingSalaryRecordId(record.id);
    const salary = parseFloat(employee?.salary || "0");
    const employerPf = parseFloat(employee?.employerPf || "0");
    const esic = parseFloat(employee?.esic || "0");
    const basicAmount = salary - employerPf - esic;

    // Auto-calculate dependent values based on basic amount
    const calculations = calculateSalaryComponents(basicAmount);

    const newForm = {
      month: record.month,
      totalWorkingDays: record.totalWorkingDays.toString(),
      actualWorkingDays: record.actualWorkingDays.toString(),
      basic: basicAmount.toString(),
      hra: calculations.hra.toString(),
      conveyance: calculations.conveyance.toString(),
      specialAllowance: calculations.specialAllowance.toString(),
      incentive: "",
      adjustment: "",
      bonus: record.bonus?.toString() || "",
      retentionBonus: "",
      advanceAny: "",
      basicEarned: "",
      hraEarned: "",
      conveyanceEarned: "",
      specialAllowanceEarned: "",
      incentiveEarned: "",
      adjustmentEarned: "",
      bonusEarned: "",
      retentionBonusEarned: "",
      advanceAnyEarned: "",
      pf: (record as any)?.pf?.toString() || employee?.pf || "",
      esic: (record as any)?.esic?.toString() || employee?.esic || "",
      pt: (record as any)?.pt?.toString() || employee?.pt || "",
      tds: (record as any)?.tds?.toString() || employee?.tds || "",
      advanceAnyDeduction: (record as any)?.advanceAnyDeduction?.toString() || "",
      retention: (record as any)?.retention?.toString() || employee?.retention || "",
      paymentDate: record.paymentDate || "",
      notes: record.notes || "",
      // Leave Details - load individual LWP values from database
      plTotal: (record as any)?.plTotal?.toString() || "",
      plAvailed: (record as any)?.plAvailed?.toString() || "",
      plSubsisting: (record as any)?.plSubsisting?.toString() || "",
      plLwp: (record as any)?.plLwp?.toString() || "",
      clTotal: (record as any)?.clTotal?.toString() || "",
      clAvailed: (record as any)?.clAvailed?.toString() || "",
      clSubsisting: (record as any)?.clSubsisting?.toString() || "",
      clLwp: (record as any)?.clLwp?.toString() || "",
      slTotal: (record as any)?.slTotal?.toString() || "",
      slAvailed: (record as any)?.slAvailed?.toString() || "",
      slSubsisting: (record as any)?.slSubsisting?.toString() || "",
      slLwp: (record as any)?.slLwp?.toString() || "",
      totalLeavesTaken: (record as any)?.totalLeavesTaken?.toString() || "",
      totalLeaveWithoutPay: (record as any)?.totalLeaveWithoutPay?.toString() || "",
      totalWorkingDaysPayable: (record as any)?.totalWorkingDaysPayable?.toString() || "",
    };

    // Auto-calculate earned values
    const earnedValues = calculateEarnedValues(newForm);
    setSalaryForm({
      ...newForm,
      ...earnedValues,
    });
    setShowSalaryForm(true);
  };

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

  const getEmployeeSalaryRecords = () => {
    return salaryRecords
      .filter((record) => record.employeeId === employee?.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
        <AppNav />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-slate-400">Loading employee details...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      <AppNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {employee.photo && (
              <img
                src={employee.photo}
                alt={employee.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEditing ? "Edit Employee" : "Employee Details"}
              </h1>
              <p className="text-slate-400">
                {employee.fullName} • {employee.department}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            title="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
            <Button
              onClick={() => {
                setActiveTab("details");
                setIsEditing(false);
              }}
              variant={activeTab === "details" ? "default" : "ghost"}
              size="sm"
              className={`${activeTab === "details" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
            >
              <User className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button
              onClick={() => {
                setActiveTab("salary");
                setIsEditing(false);
              }}
              variant={activeTab === "salary" ? "default" : "ghost"}
              size="sm"
              className={`${activeTab === "salary" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Salary
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          {activeTab === "details" && (
            <>
              {!isEditing ? (
                <Button
                  onClick={handleStartEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 space-y-8">
              {/* Photo Section */}
              {isEditing && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <Image className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Employee Photo
                    </h3>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-800/30 overflow-hidden">
                      {editPhotoPreview || employee.photo ? (
                        <img
                          src={editPhotoPreview || employee.photo}
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
                          {employee.photo ? "Change Photo" : "Add Photo"}
                        </Button>
                      </div>

                      {(editPhotoPreview || employee.photo) && (
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
                  {[
                    { label: "Full Name", key: "fullName", type: "text" },
                    { label: "Father's Name", key: "fatherName", type: "text" },
                    { label: "Mother's Name", key: "motherName", type: "text" },
                    { label: "Birth Date", key: "birthDate", type: "date" },
                    {
                      label: "Blood Group",
                      key: "bloodGroup",
                      type: "select",
                      options: bloodGroups,
                    },
                    { label: "Email", key: "email", type: "email" },
                    {
                      label: "Mobile Number",
                      key: "mobileNumber",
                      type: "tel",
                    },
                    {
                      label: "Emergency Mobile",
                      key: "emergencyMobileNumber",
                      type: "tel",
                    },
                    {
                      label: "Alternative Number",
                      key: "alternativeMobileNumber",
                      type: "tel",
                    },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-slate-300">{field.label}</Label>
                      {isEditing ? (
                        field.type === "select" ? (
                          <Select
                            value={
                              (editForm[
                                field.key as keyof Employee
                              ] as string) ||
                              (employee[field.key as keyof Employee] as string)
                            }
                            onValueChange={(value) =>
                              handleEditFormChange(field.key, value)
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type}
                            value={
                              (editForm[
                                field.key as keyof Employee
                              ] as string) ||
                              (employee[field.key as keyof Employee] as string)
                            }
                            onChange={(e) =>
                              handleEditFormChange(field.key, e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        )
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {(employee[field.key as keyof Employee] as string) ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Current Address", key: "address" },
                    { label: "Permanent Address", key: "permanentAddress" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-slate-300">{field.label}</Label>
                      {isEditing ? (
                        <Textarea
                          value={
                            (editForm[field.key as keyof Employee] as string) ||
                            (employee[field.key as keyof Employee] as string)
                          }
                          onChange={(e) =>
                            handleEditFormChange(field.key, e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white h-20"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700 min-h-[80px]">
                          {(employee[field.key as keyof Employee] as string) ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  ))}
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
                  {[
                    {
                      label: "Department",
                      key: "department",
                      type: "select",
                      options: departments.map((d) => d.name),
                    },
                    { label: "Position", key: "position", type: "text" },
                    { label: "Joining Date", key: "joiningDate", type: "date" },
                    {
                      label: "Table Number",
                      key: "tableNumber",
                      type: "select",
                      options: Array.from({ length: 32 }, (_, i) =>
                        String(i + 1),
                      ),
                    },
                    { label: "Salary", key: "salary", type: "text" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-slate-300">{field.label}</Label>
                      {isEditing ? (
                        field.type === "select" ? (
                          <Select
                            value={
                              (editForm[
                                field.key as keyof Employee
                              ] as string) ||
                              (employee[field.key as keyof Employee] as string)
                            }
                            onValueChange={(value) =>
                              handleEditFormChange(field.key, value)
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60 overflow-y-auto">
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type}
                            value={
                              (editForm[
                                field.key as keyof Employee
                              ] as string) ||
                              (employee[field.key as keyof Employee] as string)
                            }
                            onChange={(e) =>
                              handleEditFormChange(field.key, e.target.value)
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        )
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {(employee[field.key as keyof Employee] as string) ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  ))}
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
                  {[
                    { label: "Account Number", key: "accountNumber" },
                    { label: "IFSC Code", key: "ifscCode" },
                    { label: "Aadhaar Number", key: "aadhaarNumber" },
                    { label: "PAN Number", key: "panNumber" },
                    { label: "UAN Number", key: "uanNumber" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-slate-300">{field.label}</Label>
                      {isEditing ? (
                        <Input
                          value={
                            (editForm[field.key as keyof Employee] as string) ||
                            (employee[field.key as keyof Employee] as string)
                          }
                          onChange={(e) =>
                            handleEditFormChange(field.key, e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {(employee[field.key as keyof Employee] as string) ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PF Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    PF Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: "PF", key: "pf" },
                    { label: "Employer PF", key: "employerPf" },
                    { label: "ESIC", key: "esic" },
                    { label: "PT", key: "pt" },
                    { label: "TDS", key: "tds" },
                    { label: "Advance Any", key: "advanceAny" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-slate-300">{field.label}</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={
                            (editForm[field.key as keyof Employee] as string) ||
                            ""
                          }
                          onChange={(e) =>
                            handleEditFormChange(field.key, e.target.value)
                          }
                          placeholder="0"
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {(employee[field.key as keyof Employee] as string) ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {/* Retention with Type Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      {isEditing && editForm.retentionType ? editForm.retentionType : employee.retentionType || "Retention"}
                    </Label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Select
                          value={editForm.retentionType || "Retention"}
                          onValueChange={(value) =>
                            handleEditFormChange("retentionType", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Retention">Retention</SelectItem>
                            <SelectItem value="Deduction">Deduction</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={(editForm.retention as string) || ""}
                          onChange={(e) =>
                            handleEditFormChange("retention", e.target.value)
                          }
                          placeholder="0"
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    ) : (
                      <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                        {employee.retention || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                  <User className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Status</h3>
                </div>
                <Badge
                  className={
                    employee.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }
                >
                  {employee.status}
                </Badge>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Documents
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentTypes.map((docType) => {
                    const hasDoc = isEditing
                      ? (editForm[docType.key as keyof Employee] as string)
                      : (employee[docType.key as keyof Employee] as string);

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

                        <div className="space-y-2">
                          {/* Upload/Change Button */}
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={
                                isEditing
                                  ? handleEditDocumentUpload(docType.key)
                                  : handleEditDocumentUpload(docType.key)
                              }
                              disabled={!isEditing}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!isEditing}
                              className={`w-full text-xs ${
                                isEditing
                                  ? hasDoc
                                    ? "border-blue-500 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                                    : "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400 cursor-pointer"
                                  : "border-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                              }`}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {hasDoc ? "Change" : "Upload"}
                            </Button>
                          </div>

                          {/* Preview Button - only if document exists */}
                          {hasDoc && (
                            <Button
                              onClick={() =>
                                handleOpenDocumentPreview(
                                  hasDoc as string,
                                  docType.label,
                                  employee.fullName,
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

                          {/* Remove Button - only in edit mode if document exists */}
                          {isEditing && hasDoc && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs border-red-600 text-red-400 hover:bg-red-500/20"
                              onClick={() =>
                                handleEditFormChange(docType.key, "")
                              }
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Salary Tab */}
        {activeTab === "salary" && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Salary Management
                  </h3>
                </div>
                <Button
                  onClick={() => {
                    if (!showSalaryForm) {
                      setEditingSalaryRecordId(null);
                      initializeNewSalaryForm();
                    } else {
                      setEditingSalaryRecordId(null);
                    }
                    setShowSalaryForm(!showSalaryForm);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingSalaryRecordId ? "Edit Salary Record" : "Add Salary Record"}
                </Button>
              </div>

              {showSalaryForm && (
                <Card className="bg-slate-800/50 border-slate-700 mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <span>{editingSalaryRecordId ? "Edit Salary Record" : "Add New Salary Record"}</span>
                      </CardTitle>
                      <Button
                        onClick={() => {
                          setShowSalaryForm(false);
                          setEditingSalaryRecordId(null);
                          const salary = parseFloat(employee?.salary || "0");
                          const employerPf = parseFloat(employee?.employerPf || "0");
                          const esic = parseFloat(employee?.esic || "0");
                          const basicAmount = salary - employerPf - esic;

                          // Auto-calculate dependent values
                          const calculations = calculateSalaryComponents(basicAmount);

                          setSalaryForm({
                            month: "",
                            totalWorkingDays: "",
                            actualWorkingDays: "",
                            basic: basicAmount.toString(),
                            hra: calculations.hra.toString(),
                            conveyance: calculations.conveyance.toString(),
                            specialAllowance: calculations.specialAllowance.toString(),
                            incentive: "",
                            adjustment: "",
                            bonus: "",
                            retentionBonus: "",
                            advanceAny: "",
                            basicEarned: "",
                            hraEarned: "",
                            conveyanceEarned: "",
                            specialAllowanceEarned: "",
                            incentiveEarned: "",
                            adjustmentEarned: "",
                            bonusEarned: "",
                            retentionBonusEarned: "",
                            advanceAnyEarned: "",
                            pf: employee?.pf || "",
                            esic: employee?.esic || "",
                            pt: employee?.pt || "",
                            tds: employee?.tds || "",
                            advanceAnyDeduction: employee?.advanceAny || "",
                            retention: employee?.retention || "",
                            paymentDate: "",
                            notes: "",
                          });
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Employee Information Table (Pay Check) */}
                    <div className="overflow-x-auto border border-slate-700 rounded bg-slate-900/50">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr className="border-b border-slate-700">
                            <td className="w-1/2 px-4 py-3 border-r border-slate-700 text-slate-300 font-medium">Name: <span className="text-white font-bold">{employee?.fullName}</span></td>
                            <td className="w-1/2 px-4 py-3 text-slate-300 font-medium">UAN No. : <span className="text-white font-bold">{employee?.uanNumber || "N/A"}</span></td>
                          </tr>
                          <tr className="border-b border-slate-700">
                            <td className="w-1/2 px-4 py-3 border-r border-slate-700 text-slate-300 font-medium">Department : <span className="text-white font-bold">{employee?.department}</span></td>
                            <td className="w-1/2 px-4 py-3 text-slate-300 font-medium">ESIC No. : <span className="text-white font-bold">{employee?.esic || "N/A"}</span></td>
                          </tr>
                          <tr className="border-b border-slate-700">
                            <td className="w-1/2 px-4 py-3 border-r border-slate-700 text-slate-300 font-medium">Designation : <span className="text-white font-bold">{employee?.position}</span></td>
                            <td className="w-1/2 px-4 py-3 text-slate-300 font-medium">Bank A/C No. : <span className="text-white font-bold">{employee?.accountNumber || "N/A"}</span></td>
                          </tr>
                          <tr className="border-b border-slate-700">
                            <td className="w-1/2 px-4 py-3 border-r border-slate-700 text-slate-300 font-medium">Date Of Joining : <span className="text-white font-bold">{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "N/A"}</span></td>
                            <td className="w-1/2 px-4 py-3 text-slate-300 font-medium">Days In Month : <span className="text-white font-bold">{salaryForm.totalWorkingDays || "0"}</span><span className="text-slate-500 text-xs ml-2">(on probation)</span></td>
                          </tr>
                          <tr>
                            <td className="w-1/2 px-4 py-3 border-r border-slate-700 text-slate-300 font-medium">Employee Code : <span className="text-white font-bold">{employee?.employeeId}</span></td>
                            <td className="w-1/2 px-4 py-3"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Leave Details Table */}
                    <div className="space-y-2 overflow-x-auto">
                      <Label className="text-slate-300">Leave Details</Label>
                      <div className="border border-slate-700 rounded overflow-hidden bg-slate-900/50">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                              <th className="px-3 py-2 text-left text-slate-300 font-medium">Leave Type</th>
                              <th className="px-3 py-2 text-center text-slate-300 font-medium">Total In Account</th>
                              <th className="px-3 py-2 text-center text-slate-300 font-medium">Leave Availed</th>
                              <th className="px-3 py-2 text-center text-slate-300 font-medium">Subsisting Leave</th>
                              <th className="px-3 py-2 text-center text-slate-300 font-medium">LWP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {/* PL Row */}
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-3 py-2 text-white font-medium">PL</td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.plTotal}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, plTotal: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.plAvailed}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, plAvailed: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.plSubsisting}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, plSubsisting: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.plLwp}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, plLwp: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                            </tr>

                            {/* CL Row */}
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-3 py-2 text-white font-medium">CL</td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.clTotal}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, clTotal: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.clAvailed}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, clAvailed: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.clSubsisting}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, clSubsisting: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.clLwp}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, clLwp: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                            </tr>

                            {/* SL Row */}
                            <tr className="hover:bg-slate-800/50">
                              <td className="px-3 py-2 text-white font-medium">SL</td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.slTotal}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, slTotal: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.slAvailed}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, slAvailed: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.slSubsisting}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, slSubsisting: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={salaryForm.slLwp}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = parseFloat(value) || 0;
                                    setSalaryForm({ ...salaryForm, slLwp: numValue < 0 ? "0" : value })
                                  }}
                                  className="bg-slate-800/50 border-slate-600 text-white text-center h-8 w-full"
                                  placeholder="0.0"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Leave Summary Footer */}
                        <div className="border-t border-slate-700 bg-slate-800/50 px-3 py-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400">Total Leaves Taken</div>
                              <div className="text-white font-medium">
                                {((parseFloat(salaryForm.plAvailed) || 0) + (parseFloat(salaryForm.clAvailed) || 0) + (parseFloat(salaryForm.slAvailed) || 0)).toFixed(1)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400">Total Leave Without Pay</div>
                              <div className="text-white font-medium">
                                {((parseFloat(salaryForm.plLwp) || 0) + (parseFloat(salaryForm.clLwp) || 0) + (parseFloat(salaryForm.slLwp) || 0)).toFixed(1)}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400">Total Present Days</div>
                              <div className="text-white font-medium">
                                {(parseInt(salaryForm.actualWorkingDays) || 0).toString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400">Total Days Payable</div>
                              <div className="text-white font-medium">
                                {(parseInt(salaryForm.actualWorkingDays) || 0).toString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Month and Working Days */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Month</Label>
                        <Input
                          type="month"
                          value={salaryForm.month}
                          onChange={(e) =>
                            setSalaryForm({ ...salaryForm, month: e.target.value })
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Total Working Days</Label>
                        <Input
                          type="number"
                          min="0"
                          value={salaryForm.totalWorkingDays}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseFloat(value) || 0;
                            const finalValue = numValue < 0 ? "0" : value;
                            const updatedForm = {
                              ...salaryForm,
                              totalWorkingDays: finalValue,
                            };
                            const earnedValues = calculateEarnedValues(updatedForm);
                            setSalaryForm({
                              ...updatedForm,
                              ...earnedValues,
                            });
                          }}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Actual Working Days</Label>
                        <Input
                          type="number"
                          min="0"
                          value={salaryForm.actualWorkingDays}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseFloat(value) || 0;
                            const finalValue = numValue < 0 ? "0" : value;
                            const updatedForm = {
                              ...salaryForm,
                              actualWorkingDays: finalValue,
                            };
                            const earnedValues = calculateEarnedValues(updatedForm);
                            setSalaryForm({
                              ...updatedForm,
                              ...earnedValues,
                            });
                          }}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    {/* Earnings Section */}
                    <div className="space-y-3">
                      <h4 className="text-slate-200 font-semibold text-sm">Earnings</h4>

                      {/* Basic Salary Input - Auto-calculated as Salary - Employer PF - ESIC */}
                      <div className="bg-slate-800/30 border border-slate-700 rounded p-4">
                        <Label className="text-slate-300 text-sm font-medium block mb-2">Basic Salary = Salary - Employer PF - ESIC (Auto-calculates HRA, Conveyance & Special Allowance)</Label>
                        <div className="px-3 py-3 bg-slate-900/50 border border-slate-700 rounded text-white font-medium text-lg">
                          {salaryForm.basic}
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-700 rounded">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700">
                              <th className="px-4 py-2 text-left text-slate-300 font-semibold text-sm">Earning</th>
                              <th className="px-4 py-2 text-right text-slate-300 font-semibold text-sm">Actual Gross</th>
                              <th className="px-4 py-2 text-right text-slate-300 font-semibold text-sm">Earned Gross</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: "Basic", key: "basic", earnedKey: "basicEarned", isReadOnly: true, displayAsActualBasic: true },
                              { label: "HRA", key: "hra", earnedKey: "hraEarned", isReadOnly: true },
                              { label: "Conveyance", key: "conveyance", earnedKey: "conveyanceEarned", isReadOnly: true },
                              { label: "Sp. Allowance", key: "specialAllowance", earnedKey: "specialAllowanceEarned", isReadOnly: true },
                              { label: "Incentive", key: "incentive", earnedKey: "incentiveEarned" },
                              { label: "Adjustment", key: "adjustment", earnedKey: "adjustmentEarned" },
                              { label: "Bonus", key: "bonus", earnedKey: "bonusEarned" },
                              { label: "Retention Bonus", key: "retentionBonus", earnedKey: "retentionBonusEarned" },
                              { label: "Advance Any", key: "advanceAny", earnedKey: "advanceAnyEarned" },
                            ].map((field) => {
                              const actualValue = parseFloat(salaryForm[field.key as keyof typeof salaryForm] as string) || 0;
                              const earnedValue = parseFloat(salaryForm[field.earnedKey as keyof typeof salaryForm] as string) || 0;

                              return (
                                <tr key={field.key} className="border-b border-slate-700 hover:bg-slate-800/30">
                                  <td className="px-4 py-3 text-slate-300 text-sm font-medium">{field.label}</td>
                                  <td className="px-4 py-3 text-right">
                                    {field.isReadOnly ? (
                                      <div className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm font-medium text-right">
                                        {field.displayAsActualBasic ? (actualValue * 0.5).toFixed(2) : actualValue.toFixed(2)}
                                      </div>
                                    ) : (
                                      <Input
                                        type="number"
                                        min="0"
                                        value={salaryForm[field.key as keyof typeof salaryForm]}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const numValue = parseFloat(value) || 0;
                                          const finalValue = numValue < 0 ? "0" : value;

                                          // If Basic field is changed, auto-calculate dependent fields
                                          if (field.key === "basic") {
                                            const basicValue = parseFloat(finalValue) || 0;
                                            const calculations = calculateSalaryComponents(basicValue);

                                            const updatedForm = {
                                              ...salaryForm,
                                              basic: finalValue,
                                              hra: calculations.hra.toString(),
                                              conveyance: calculations.conveyance.toString(),
                                              specialAllowance: calculations.specialAllowance.toString(),
                                            };

                                            // Auto-calculate earned values
                                            const earnedValues = calculateEarnedValues(updatedForm);
                                            setSalaryForm({
                                              ...updatedForm,
                                              ...earnedValues,
                                            });
                                          } else {
                                            const updatedForm = {
                                              ...salaryForm,
                                              [field.key]: finalValue,
                                            };

                                            // Auto-calculate earned values for any actual field change
                                            const earnedValues = calculateEarnedValues(updatedForm);
                                            setSalaryForm({
                                              ...updatedForm,
                                              ...earnedValues,
                                            });
                                          }
                                        }}
                                        className="bg-slate-800/50 border-slate-700 text-white text-sm w-full text-right"
                                        placeholder="0"
                                      />
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm font-medium text-right">
                                      {earnedValue.toFixed(2)}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Gross Earnings Total Row */}
                            {(() => {
                              const actualFields = [
                                "basic", "hra", "conveyance", "specialAllowance",
                                "incentive", "adjustment", "bonus", "retentionBonus", "advanceAny"
                              ];
                              const earnedFields = [
                                "basicEarned", "hraEarned", "conveyanceEarned", "specialAllowanceEarned",
                                "incentiveEarned", "adjustmentEarned", "bonusEarned", "retentionBonusEarned", "advanceAnyEarned"
                              ];

                              let totalActual = 0;
                              let totalEarned = 0;

                              actualFields.forEach((field) => {
                                let value = parseFloat(salaryForm[field as keyof typeof salaryForm] as string) || 0;
                                // For Basic field, use Actual Gross (50% of basic)
                                if (field === "basic") {
                                  value = value * 0.5;
                                }
                                // Subtract advanceAny instead of adding it
                                if (field === "advanceAny") {
                                  totalActual -= value;
                                } else {
                                  totalActual += value;
                                }
                              });

                              earnedFields.forEach((field) => {
                                const value = parseFloat(salaryForm[field as keyof typeof salaryForm] as string) || 0;
                                // Subtract advanceAnyEarned instead of adding it
                                if (field === "advanceAnyEarned") {
                                  totalEarned -= value;
                                } else {
                                  totalEarned += value;
                                }
                              });

                              return (
                                <tr className="bg-slate-800/70 border-t-2 border-slate-600">
                                  <td className="px-4 py-3 text-white text-sm font-bold">Gross Earnings</td>
                                  <td className="px-4 py-3 text-right text-white text-sm font-bold">
                                    {totalActual.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-white text-sm font-bold">
                                    {totalEarned.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Deductions Section - Read Only (from Employee Personal Info) */}
                    <div className="space-y-3">
                      <h4 className="text-slate-200 font-semibold text-sm">Deductions (From Personal Information)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { label: "PF", key: "pf", value: employee?.pf || "0" },
                          { label: "ESIC", key: "esic", value: employee?.esic || "0" },
                          { label: "PT", key: "pt", value: employee?.pt || "0" },
                          { label: "TDS", key: "tds", value: employee?.tds || "0" },
                          { label: "Advance Any", key: "advanceAnyDeduction", value: employee?.advanceAny || "0" },
                          { label: "Retention", key: "retention", value: employee?.retention || "0" },
                        ].map((field) => (
                          <div key={field.key} className="space-y-1">
                            <Label className="text-slate-300 text-xs">
                              {field.label}
                            </Label>
                            <div className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded text-slate-400 text-sm">
                              {field.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 italic">
                        * Deduction values are taken from employee's personal information and cannot be edited here
                      </p>
                    </div>

                    {/* Payment Date and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Payment Date (Optional)</Label>
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
                      <Label className="text-slate-300">Notes (Optional)</Label>
                      <Textarea
                        value={salaryForm.notes}
                        onChange={(e) =>
                          setSalaryForm({ ...salaryForm, notes: e.target.value })
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        placeholder="Any additional notes..."
                      />
                    </div>

                    {/* Net Salary Credited - Auto-calculated */}
                    <div className="space-y-2">
                      <Label className="text-slate-300">Net Salary Credited</Label>
                      <div className="px-3 py-3 bg-slate-900/50 border border-slate-700 rounded text-white font-medium">
                        {(() => {
                          // Calculate total earned gross
                          const earnedFields = [
                            "basicEarned", "hraEarned", "conveyanceEarned", "specialAllowanceEarned",
                            "incentiveEarned", "adjustmentEarned", "bonusEarned", "retentionBonusEarned", "advanceAnyEarned"
                          ];
                          let totalEarnedGross = 0;
                          earnedFields.forEach((field) => {
                            const value = parseFloat(salaryForm[field as keyof typeof salaryForm] as string) || 0;
                            if (field === "advanceAnyEarned") {
                              totalEarnedGross -= value;
                            } else {
                              totalEarnedGross += value;
                            }
                          });

                          // Calculate deductions
                          const pf = parseFloat(salaryForm.pf as string) || 0;
                          const esic = parseFloat(salaryForm.esic as string) || 0;
                          const pt = parseFloat(salaryForm.pt as string) || 0;
                          const tds = parseFloat(salaryForm.tds as string) || 0;
                          const advanceAnyDeduction = parseFloat(salaryForm.advanceAnyDeduction as string) || 0;
                          const retention = parseFloat(salaryForm.retention as string) || 0;

                          const totalDeductions = pf + esic + pt + tds + advanceAnyDeduction + retention;
                          const netSalaryCredited = totalEarnedGross - totalDeductions;

                          return (
                            <div className="space-y-1">
                              <div className="text-lg">{netSalaryCredited.toFixed(2)}</div>
                              <div className="text-sm text-slate-400">{numberToWords(Math.floor(netSalaryCredited))}</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddSalaryRecord}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Record
                      </Button>
                      <Button
                        onClick={() => setShowSalaryForm(false)}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(() => {
                const employeeSalaryRecords = getEmployeeSalaryRecords();
                return employeeSalaryRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">
                      No Salary Records
                    </h4>
                    <p className="text-slate-400">
                      No salary records found for this employee.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employeeSalaryRecords.map((record) => (
                      <div key={record.id} className="space-y-4">
                        {/* Summary Card */}
                        <Card
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
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      navigate("/payslip", {
                                        state: { record, employee }
                                      })
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                                    title="View Payslip"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleEditSalaryRecord(record)
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
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
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-green-400">Net Salary Credited</p>
                                <div className="space-y-1">
                                  <p className="text-white font-bold text-lg">
                                    ₹{record.totalSalary.toLocaleString()}
                                  </p>
                                  <p className="text-green-300 text-xs">
                                    {numberToWords(Math.floor(record.totalSalary))}
                                  </p>
                                </div>
                              </div>
                              {record.bonus && record.bonus > 0 && (
                                <div>
                                  <p className="text-slate-400">Bonus</p>
                                  <p className="text-green-400 font-medium">
                                    +₹{record.bonus.toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {record.deductions && record.deductions > 0 && (
                                <div>
                                  <p className="text-slate-400">Deductions</p>
                                  <p className="text-red-400 font-medium">
                                    -₹{record.deductions.toLocaleString()}
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
                                <p className="text-slate-400 text-sm">Notes:</p>
                                <p className="text-slate-300 text-sm mt-1">
                                  {record.notes}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Salary Slip Detail */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                          {(() => {
                            // Find matching leave record for this salary record
                            const matchingLeaveRecord = leaveRecords.find(
                              (lr) => lr.employeeId === record.employeeId && lr.month === record.month
                            );
                            return (
                              <SalarySlip
                                employee={employee}
                                record={record}
                                leaveRecord={matchingLeaveRecord}
                                className="w-full"
                              />
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
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
                    onClick={() =>
                      setDocumentPreviewModal({
                        isOpen: false,
                        documentUrl: "",
                        documentType: "",
                        employeeName: "",
                      })
                    }
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
            </Card>
          </div>
        )}
      </main>

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
