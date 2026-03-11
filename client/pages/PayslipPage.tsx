import { Payslip } from "@/components/Payslip";
import AppNav from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { convertNumberToWords } from "@/lib/utils";
import React from "react";

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year?: number;
  totalWorkingDays: number;
  actualWorkingDays: number;
  // Earnings
  basic: number;
  hra: number;
  conveyance: number;
  specialAllowance: number;
  incentive: number;
  adjustment: number;
  bonus: number;
  retentionBonus?: number;
  advanceAny?: number;
  // Earned Amounts
  basicEarned: number;
  hraEarned: number;
  conveyanceEarned: number;
  specialAllowanceEarned: number;
  incentiveEarned: number;
  adjustmentEarned: number;
  bonusEarned: number;
  retentionBonusEarned?: number;
  advanceAnyEarned?: number;
  // Deductions
  pf: number;
  esic: number;
  pt: number;
  tds: number;
  advanceAnyDeduction?: number;
  retention: number;
  // Totals
  totalSalary: number;
  // Other
  paymentDate?: string;
  notes?: string;
  // Leave Details
  plTotal?: number;
  plAvailed?: number;
  plSubsisting?: number;
  clTotal?: number;
  clAvailed?: number;
  clSubsisting?: number;
  slTotal?: number;
  slAvailed?: number;
  slSubsisting?: number;
  lwp: number;
  totalLeavesTaken?: number;
  totalLeaveWithoutPay?: number;
  totalWorkingDaysPayable?: number;
  createdAt: string;
}

interface Employee {
  fullName: string;
  uanNumber?: string;
  department: string;
  position: string;
  dateOfJoining?: string;
  _id?: string;
  esic?: string;
  accountNumber?: string;
  retentionType?: "Retention" | "Deduction";
}

// Company Information (Fixed for all payslips)
const COMPANY_NAME = "INFOSEUM IT OPC PVT LTD.";
const COMPANY_ADDRESS = "Imperial Heights -701, Near Akshar Chowk, Atladra, Vadodara-390012,Gujarat";

export default function PayslipPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { record, employee } = location.state || {};
  const [leaveRecord, setLeaveRecord] = React.useState<any>(null);
  const [isLoadingLeave, setIsLoadingLeave] = React.useState(true);

  // Fetch leave record for the employee and month
  React.useEffect(() => {
    const fetchLeaveRecord = async () => {
      // Use MongoDB _id for leave record lookup (as leave records are saved with _id)
      const empId = employee?._id;
      const monthValue = record?.month;
      
      console.log('=== LEAVE FETCH DEBUG ===');
      console.log('Employee object:', employee);
      console.log('Record object:', record);
      console.log('Using employee._id:', empId);
      console.log('Using month:', monthValue);
      
      if (empId && monthValue) {
        try {
          setIsLoadingLeave(true);
          console.log('Fetching leave record for:', { employeeId: empId, month: monthValue });
          const response = await fetch(`/api/leave-records/employee/${empId}`);
          const data = await response.json();
          
          console.log('Leave records API response:', data);
          
          if (data.success && data.data) {
            // Find the leave record matching the salary record month
            const matchingLeave = data.data.find((lr: any) => lr.month === monthValue);
            console.log('Matching leave record:', matchingLeave);
            if (matchingLeave) {
              setLeaveRecord(matchingLeave);
              console.log('Leave record set successfully:', matchingLeave);
            } else {
              console.log('No matching leave record found for month:', monthValue);
              console.log('Available months:', data.data.map((r: any) => r.month));
            }
          } else {
            console.log('No leave records found in API response');
          }
        } catch (error) {
          console.error('Error fetching leave record:', error);
        } finally {
          setIsLoadingLeave(false);
        }
      } else {
        console.log('Missing data:', { employeeId: empId, month: monthValue });
        setIsLoadingLeave(false);
      }
    };

    fetchLeaveRecord();
  }, [employee?.employeeId, employee?._id, record?.month]);

  console.log('=== PAYSLIP PAGE ===');
  console.log('Received record:', record);
  console.log('Leave record from API:', leaveRecord);
  console.log('Is loading leave:', isLoadingLeave);

  // Build payslip data from employee and salary record
  const getPayslipData = () => {
    console.log('=== INSIDE getPayslipData ===');
    console.log('leaveRecord value:', leaveRecord);
    
    if (leaveRecord) {
      console.log('=== LWP VALUES FROM LEAVE RECORD ===');
      console.log('plLwp:', leaveRecord.plLwp);
      console.log('clLwp:', leaveRecord.clLwp);
      console.log('slLwp:', leaveRecord.slLwp);
    }
    
    if (record && employee) {
      const monthDate = new Date(record.month + "-01");
      const year = record.year || monthDate.getFullYear();
      const monthNum = parseInt(record.month.split("-")[1] || record.month);

      // Use ALL values directly from database - Salary Management
      const basicSalary = record.basic || 0;
      const hra = record.hra || 0;
      const conveyance = record.conveyance || 0;
      const specialAllowance = record.specialAllowance || 0;
      const bonus = record.bonus || 0;
      const incentive = record.incentive || 0;
      const adjustment = record.adjustment || 0;
      const retentionBonus = record.retentionBonus || 0;
      const advanceAny = record.advanceAny || 0;

      // Use earned amounts directly from database
      const basicEarned = record.basicEarned || 0;
      const hraEarned = record.hraEarned || 0;
      const conveyanceEarned = record.conveyanceEarned || 0;
      const specialAllowanceEarned = record.specialAllowanceEarned || 0;
      const incentiveEarned = record.incentiveEarned || 0;
      const adjustmentEarned = record.adjustmentEarned || 0;
      const bonusEarned = record.bonusEarned || 0;
      const retentionBonusEarned = record.retentionBonusEarned || 0;
      const advanceAnyEarned = record.advanceAnyEarned || 0;

      const totalEarningsActual = record.actualGross || (basicSalary + hra + conveyance + specialAllowance + bonus + incentive + adjustment + retentionBonus + advanceAny);
      const totalEarningsEarned = record.earnedGross || (basicEarned + hraEarned + conveyanceEarned + specialAllowanceEarned + incentiveEarned + adjustmentEarned + bonusEarned + retentionBonusEarned + advanceAnyEarned);

      // Deductions - use database values directly
      const pf = record.pf || 0;
      const esic = record.esic || 0;
      const pt = record.pt || 0;
      const tds = record.tds || 0;
      const advanceAnyDeduction = record.advanceAnyDeduction || 0;
      const retention = record.retention || 0;
      const totalDeductions = record.deductions || (pf + esic + pt + tds + advanceAnyDeduction + retention);

      return {
        companyName: COMPANY_NAME,
        companyAddress: COMPANY_ADDRESS,
        employeeName: employee.fullName || "N/A",
        uanNo: employee.uanNumber || "N/A",
        department: employee.department || "N/A",
        designation: employee.position || "N/A",
        dateOfJoining: employee.joiningDate || "N/A",
        employeeCode: employee.employeeId || "N/A",
        esicNo: employee.esic || "N/A",
        bankAccountNo: employee.accountNumber || "N/A",
        daysInMonth: record.totalWorkingDays || 30,
        leaves: [
          { 
            type: "PL", 
            total: leaveRecord?.plTotalLeaveInAccount || 0, 
            availed: leaveRecord?.plLeaveAvailed || 0, 
            subsisting: leaveRecord?.plSubsistingLeave || 0, 
            lwp: leaveRecord?.plLwp || 0 
          },
          { 
            type: "CL", 
            total: leaveRecord?.clTotalLeaveInAccount || 0, 
            availed: leaveRecord?.clLeaveAvailed || 0, 
            subsisting: leaveRecord?.clSubsistingLeave || 0, 
            lwp: leaveRecord?.clLwp || 0 
          },
          { 
            type: "SL", 
            total: leaveRecord?.slTotalLeaveInAccount || 0, 
            availed: leaveRecord?.slLeaveAvailed || 0, 
            subsisting: leaveRecord?.slSubsistingLeave || 0, 
            lwp: leaveRecord?.slLwp || 0 
          },
        ],
        totalLeavesTaken: (leaveRecord?.plLeaveAvailed || 0) + (leaveRecord?.clLeaveAvailed || 0) + (leaveRecord?.slLeaveAvailed || 0),
        totalLeaveWithoutPay: (leaveRecord?.plLwp || 0) + (leaveRecord?.clLwp || 0) + (leaveRecord?.slLwp || 0),
        totalPresentDays: record.actualWorkingDays,
        totalDaysPayable: record.totalWorkingDaysPayable || record.actualWorkingDays,
        earnings: [
          { name: "Basic", actualGross: basicSalary, earnedGross: basicEarned },
          { name: "HRA", actualGross: hra, earnedGross: hraEarned },
          { name: "Conveyance", actualGross: conveyance, earnedGross: conveyanceEarned },
          { name: "Sp. Allowance", actualGross: specialAllowance, earnedGross: specialAllowanceEarned },
          { name: "Bonus", actualGross: bonus, earnedGross: bonusEarned },
          { name: "Incentive", actualGross: incentive, earnedGross: incentiveEarned },
          { name: "Adjustment", actualGross: adjustment, earnedGross: adjustmentEarned },
          { name: "Retention Bonus", actualGross: retentionBonus, earnedGross: retentionBonusEarned },
          { name: "Advance Any", actualGross: advanceAny, earnedGross: advanceAnyEarned },
        ],
        deductions: [
          { name: "PF", amount: pf },
          { name: "ESIC", amount: esic },
          { name: "PT", amount: pt },
          { name: "TDS", amount: tds },
          { name: retention < 0 ? "Deduction" : "Retention", amount: retention },
          ...(advanceAnyDeduction > 0 ? [{ name: "Advance Deduction", amount: advanceAnyDeduction }] : []),
        ],
        grossEarnings: totalEarningsActual,
        earnedGrossEarnings: totalEarningsEarned,
        totalDeduction: totalDeductions,
        netSalaryCredited: record.netSalary || record.totalSalary || (totalEarningsEarned - totalDeductions),
        month: monthNum,
        year: year,
        amountInWords: convertNumberToWords(Math.round(record.netSalary || record.totalSalary || (totalEarningsEarned - totalDeductions))),
      };
    }

    return null;
  };

  const payslipData = React.useMemo(() => getPayslipData(), [record, employee, leaveRecord]);

  // Show loading state while fetching leave data
  if (isLoadingLeave) {
    return (
      <div className="min-h-screen bg-white">
        <AppNav />
        <div className="bg-white py-8">
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payslip data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!payslipData) {
    return (
      <div className="min-h-screen bg-white">
        <AppNav />
        <div className="bg-white py-8">
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-slate-600 hover:text-black hover:bg-slate-100"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold text-black">
                No Salary Data
              </h1>
            </div>
            <div className="bg-white rounded-lg p-8">
              <p className="text-center text-gray-700 text-lg">
                Please select a salary record from the Employee Details page to view the payslip.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const monthName = new Date(payslipData.year, payslipData.month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  // Helper function to prepare cloned element for download with proper vertical centering
  const prepareClonedElement = (element: HTMLElement) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';
    wrapper.style.backgroundColor = '#ffffff';
    wrapper.style.padding = '40px 0';
    wrapper.style.width = element.offsetWidth + 'px';
    wrapper.style.minHeight = 'auto';
    wrapper.style.boxSizing = 'border-box';

    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.margin = '0';
    clonedElement.style.padding = '30px';
    clonedElement.style.width = element.offsetWidth + 'px';
    clonedElement.style.minHeight = 'auto';
    clonedElement.style.boxSizing = 'border-box';

    // Force white background on all divs
    const allDivs = clonedElement.querySelectorAll('div');
    allDivs.forEach((div) => {
      const htmlDiv = div as HTMLElement;
      if (!htmlDiv.style.backgroundColor || htmlDiv.style.backgroundColor === 'transparent') {
        htmlDiv.style.backgroundColor = '#ffffff';
      }
    });

    // Wrap cell content in flex containers for proper vertical centering in html2canvas
    const allCells = clonedElement.querySelectorAll('td, th');
    allCells.forEach((cell) => {
      const htmlCell = cell as HTMLElement;
      const content = htmlCell.innerHTML;
      
      // Get background color from cell or use white
      const bgColor = htmlCell.style.backgroundColor || '#ffffff';
      
      // Wrap content in a flex container for vertical centering
      htmlCell.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; min-height: 40px; width: 100%; padding: 12px; box-sizing: border-box; background-color: ${bgColor};">${content}</div>`;
      
      // Set cell styles
      htmlCell.style.setProperty('padding', '0', 'important');
      htmlCell.style.setProperty('text-align', 'center', 'important');
      htmlCell.style.setProperty('vertical-align', 'middle', 'important');
      htmlCell.style.setProperty('background-color', bgColor, 'important');
    });

    // Force white background on all tables
    const allTables = clonedElement.querySelectorAll('table');
    allTables.forEach((table) => {
      (table as HTMLElement).style.backgroundColor = '#ffffff';
    });

    wrapper.appendChild(clonedElement);
    return wrapper;
  };

  return (
    <div className="min-h-screen bg-white">
      <AppNav />
      <div className="bg-white py-8">
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 no-print">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-600 hover:text-black hover:bg-slate-100"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-black">
              Pay Check - {monthName}
            </h1>
          </div>

          {/* Payslip Container */}
          <div className="bg-white">
            <div id="payslip-container" className="bg-white" style={{ backgroundColor: '#ffffff', margin: 0, padding: 0 }}>
              <Payslip data={payslipData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mt-8 mb-8 no-print" style={{padding: '20px'}}>
            <Button
              onClick={async () => {
                try {
                  const element = document.getElementById('payslip-container');
                  if (!element) {
                    alert('Payslip not found');
                    return;
                  }

                  // Prepare cloned element with proper vertical centering
                  const wrapper = prepareClonedElement(element);
                  document.body.appendChild(wrapper);

                  // Wait for content to render
                  await new Promise((resolve) => setTimeout(resolve, 200));

                  const canvas = await html2canvas(wrapper as HTMLElement, {
                    scale: 1.5,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    allowTaint: true,
                    imageTimeout: 0
                  });

                  // Remove wrapper
                  document.body.removeChild(wrapper);

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

                  // Get image data and download (use JPEG to avoid alpha/transparency)
                  const imgData = finalCanvas.toDataURL('image/jpeg', 1.0);
                  const link = document.createElement('a');
                  const monthName = new Date(payslipData.year, payslipData.month - 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric'
                  });
                  link.href = imgData;
                  link.download = `Payslip_${monthName}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success('Image Downloaded Successfully');
                } catch (error) {
                  console.error('Error generating image:', error);
                  toast.error('Failed to generate image');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Download Image
            </Button>

            <Button
              onClick={async () => {
                try {
                  const element = document.getElementById('payslip-container');
                  if (!element) {
                    alert('Payslip not found');
                    return;
                  }

                  // Prepare cloned element with proper vertical centering
                  const wrapper = prepareClonedElement(element);
                  document.body.appendChild(wrapper);

                  // Wait for content to render
                  await new Promise((resolve) => setTimeout(resolve, 200));

                  const canvas = await html2canvas(wrapper as HTMLElement, {
                    scale: 1.5,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    allowTaint: true,
                    imageTimeout: 0
                  });

                  // Remove wrapper
                  document.body.removeChild(wrapper);

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

                  // Get image data and send to server for PDF generation with password (use JPEG to avoid alpha)
                  const imgData = finalCanvas.toDataURL('image/jpeg', 1.0);
                  const imgBase64 = imgData.split(',')[1];

                  const monthName = new Date(payslipData.year, payslipData.month - 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric'
                  });

                  // Send to server for encryption
                  let uanNo = employee?.uanNumber || payslipData.uanNo || "1234";
                  // Ensure password is exactly 4 digits (last 4 of UAN)
                  let uanPassword = String(uanNo).replace(/\D/g, '').slice(-4);
                  // If password is less than 4 digits, pad with zeros
                  if (uanPassword.length < 4) {
                    uanPassword = uanPassword.padStart(4, '0');
                  }

                  const response = await fetch('/api/encrypt-pdf', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      image: imgBase64,
                      password: uanPassword,
                      fileName: `Payslip_${monthName}`
                    })
                  });

                  if (!response.ok) {
                    throw new Error('Failed to encrypt PDF');
                  }

                  // Download the encrypted PDF
                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = `Payslip_${monthName}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(downloadUrl);

                  toast.success('PDF Downloaded Successfully');
                } catch (error) {
                  console.error('Error generating PDF:', error);
                  toast.error('Failed to generate PDF');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
