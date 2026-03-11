import mongoose, { Schema, Document } from "mongoose";

export interface ISalaryRecord extends Document {
  employeeId: string;
  month: string; // YYYY-MM format
  year: number;
  totalWorkingDays: number;
  actualWorkingDays: number;
  // Earnings (Actual Gross)
  basic?: number;
  hra?: number;
  conveyance?: number;
  specialAllowance?: number;
  bonus?: number;
  incentive?: number;
  adjustment?: number;
  retentionBonus?: number;
  advanceAny?: number;
  // Earnings (Earned Gross based on working days)
  basicEarned?: number;
  hraEarned?: number;
  conveyanceEarned?: number;
  specialAllowanceEarned?: number;
  incentiveEarned?: number;
  adjustmentEarned?: number;
  bonusEarned?: number;
  retentionBonusEarned?: number;
  advanceAnyEarned?: number;
  actualGross?: number;
  earnedGross?: number;
  netSalary?: number;
  // Totals (legacy fields for backward compatibility)
  basicSalary?: number;
  deductions?: number;
  totalSalary: number;
  // Individual Deductions
  pf?: number;
  esic?: number;
  pt?: number;
  tds?: number;
  advanceAnyDeduction?: number;
  retention?: number;
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
  lwp?: number;
  plLwp?: number;
  clLwp?: number;
  slLwp?: number;
  totalLeavesTaken?: number;
  totalLeaveWithoutPay?: number;
  totalWorkingDaysPayable?: number;
  // Other
  paymentDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const salaryRecordSchema = new Schema<ISalaryRecord>(
  {
    employeeId: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    totalWorkingDays: { type: Number, required: true },
    actualWorkingDays: { type: Number, required: true },
    // Earnings (Actual Gross)
    basic: Number,
    hra: Number,
    conveyance: Number,
    specialAllowance: Number,
    bonus: Number,
    incentive: Number,
    adjustment: Number,
    retentionBonus: Number,
    advanceAny: Number,
    // Earnings (Earned Gross based on working days)
    basicEarned: Number,
    hraEarned: Number,
    conveyanceEarned: Number,
    specialAllowanceEarned: Number,
    incentiveEarned: Number,
    adjustmentEarned: Number,
    bonusEarned: Number,
    retentionBonusEarned: Number,
    advanceAnyEarned: Number,
    actualGross: Number,
    earnedGross: Number,
    netSalary: Number,
    // Totals (legacy fields for backward compatibility)
    basicSalary: Number,
    deductions: Number,
    totalSalary: { type: Number, required: true },
    // Individual Deductions
    pf: Number,
    esic: Number,
    pt: Number,
    tds: Number,
    advanceAnyDeduction: Number,
    retention: Number,
    // Leave Details
    plTotal: Number,
    plAvailed: Number,
    plSubsisting: Number,
    clTotal: Number,
    clAvailed: Number,
    clSubsisting: Number,
    slTotal: Number,
    slAvailed: Number,
    slSubsisting: Number,
    lwp: Number,
    plLwp: Number,
    clLwp: Number,
    slLwp: Number,
    totalLeavesTaken: Number,
    totalLeaveWithoutPay: Number,
    totalWorkingDaysPayable: Number,
    // Other
    paymentDate: String,
    notes: String,
  },
  { timestamps: true }
);

// Create compound index for employeeId and month
salaryRecordSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const SalaryRecord =
  mongoose.models.SalaryRecord ||
  mongoose.model<ISalaryRecord>("SalaryRecord", salaryRecordSchema);
