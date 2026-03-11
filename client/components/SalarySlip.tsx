import React from "react";
import { cn, convertNumberToWords } from "@/lib/utils";

interface SalarySlipProps {
  employee: any;
  record: any;
  leaveRecord?: any;
  className?: string;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({ employee, record, leaveRecord, className }) => {
  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const earningRows = [
    { label: "Basic", actual: record.basic, earned: record.basicEarned },
    { label: "HRA", actual: record.hra, earned: record.hraEarned },
    { label: "Conveyance", actual: record.conveyance, earned: record.conveyanceEarned },
    { label: "Sp. Allowance", actual: record.specialAllowance, earned: record.specialAllowanceEarned },
    { label: "Bonus", actual: record.bonus, earned: record.bonusEarned },
    { label: "Incentive", actual: record.incentive, earned: record.incentiveEarned },
    { label: "Adjustment", actual: record.adjustment, earned: record.adjustmentEarned },
    { label: "Retention Bonus", actual: record.retentionBonus, earned: record.retentionBonusEarned },
    { label: "Advance Any", actual: record.advanceAny, earned: record.advanceAnyEarned },
  ];

  const deductionRows = [
    { label: "PF", amount: record.pf },
    { label: "ESIC", amount: record.esic },
    { label: "PT", amount: record.pt },
    { label: "TDS", amount: record.tds },
    { label: "Retention", amount: record.retention },
    { label: "", amount: null },
    { label: "", amount: null },
    { label: "", amount: null },
    { label: "", amount: null },
  ];

  const netSalary = record.netSalary || record.totalSalary || 0;

  return (
    <div className={cn("bg-white text-black p-6 font-sans text-xs", className)}>
      {/* Employee Information Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1e40af] mb-4 border-b-2 border-[#4a86e8] pb-1 uppercase">Employee Information</h2>
        <table className="w-full border-collapse border border-slate-300">
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50 w-1/4">Name:</td>
              <td className="border border-slate-300 px-3 py-2 w-1/4">{employee?.fullName}</td>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50 w-1/4">UAN No:</td>
              <td className="border border-slate-300 px-3 py-2 w-1/4">{employee?.uanNumber || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50">Department:</td>
              <td className="border border-slate-300 px-3 py-2">{employee?.department}</td>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50">ESIC No:</td>
              <td className="border border-slate-300 px-3 py-2">{employee?.esic || "N/A"}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50">Designation:</td>
              <td className="border border-slate-300 px-3 py-2">{employee?.position}</td>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50">Days in Month:</td>
              <td className="border border-slate-300 px-3 py-2">{record.totalWorkingDays || 30}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50">Joining Date:</td>
              <td className="border border-slate-300 px-3 py-2">{employee?.joiningDate}</td>
              <td className="border border-slate-300 px-3 py-2 font-bold bg-slate-50">Employee Code:</td>
              <td className="border border-slate-300 px-3 py-2">{employee?.employeeId}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Salary Details Table */}
      <table className="w-full border-collapse border border-slate-300">
        <thead className="bg-[#4a86e8] text-white">
          <tr>
            <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/5">EARNING</th>
            <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/5">ACTUAL</th>
            <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/5">EARNED</th>
            <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/5">DEDUCTION</th>
            <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/5">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {earningRows.map((row, idx) => (
            <tr key={idx}>
              <td className="border border-slate-300 px-4 py-1 font-bold">{row.label}</td>
              <td className="border border-slate-300 px-4 py-1 text-center">{row.actual !== undefined ? formatCurrency(row.actual) : "0.00"}</td>
              <td className="border border-slate-300 px-4 py-1 text-center">{row.earned !== undefined ? formatCurrency(row.earned) : "0.00"}</td>
              <td className="border border-slate-300 px-4 py-1 font-bold">{deductionRows[idx]?.label}</td>
              <td className="border border-slate-300 px-4 py-1 text-center">{deductionRows[idx]?.amount !== null ? formatCurrency(deductionRows[idx].amount) : "0.00"}</td>
            </tr>
          ))}
          <tr className="bg-[#d9e9ff] font-bold">
            <td className="border border-slate-300 px-4 py-1 uppercase">Gross Earnings</td>
            <td className="border border-slate-300 px-4 py-1 text-center">{formatCurrency(record.actualGross)}</td>
            <td className="border border-slate-300 px-4 py-1 text-center">{formatCurrency(record.earnedGross)}</td>
            <td className="border border-slate-300 px-4 py-1 uppercase">Total Deduction</td>
            <td className="border border-slate-300 px-4 py-1 text-center">{formatCurrency(record.deductions)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-[#1c4587] text-white font-bold text-sm">
            <td colSpan={3} className="border border-slate-300 px-4 py-2 text-center uppercase">Net Salary Credited</td>
            <td colSpan={2} className="border border-slate-300 px-4 py-2 text-center">₹ {formatCurrency(netSalary)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="border border-slate-300 px-4 py-4 text-center font-bold">Amount (in words)</td>
            <td colSpan={2} className="border border-slate-300 px-4 py-4 text-center text-[#38761d] italic font-semibold">
              {convertNumberToWords(netSalary)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Leave Details Section */}
      {leaveRecord && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-[#1e40af] mb-4 border-b-2 border-[#4a86e8] pb-1 uppercase">Leave Details</h2>
          <table className="w-full border-collapse border border-slate-300">
            <thead className="bg-[#4a86e8] text-white">
              <tr>
                <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/4">Leave Type</th>
                <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/4">Total Leave In The Account</th>
                <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/4">Leave Availed</th>
                <th className="border border-slate-300 px-2 py-1 uppercase font-bold text-center w-1/4">Subsisting Leave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-1 font-bold">PL (Paid Leave)</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.plTotalLeaveInAccount || 0}</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.plLeaveAvailed || 0}</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.plSubsistingLeave || 0}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-1 font-bold">CL (Casual Leave)</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.clTotalLeaveInAccount || 0}</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.clLeaveAvailed || 0}</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.clSubsistingLeave || 0}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-1 font-bold">SL (Sick Leave)</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.slTotalLeaveInAccount || 0}</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.slLeaveAvailed || 0}</td>
                <td className="border border-slate-300 px-4 py-1 text-center">{leaveRecord.slSubsistingLeave || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
