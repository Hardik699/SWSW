import mongoose, { Schema, Document } from "mongoose";

export interface ISalarySlipRecord extends Document {
  employeeId: string;
  salaryRecordId: string;
  leaveRecordId?: string;
  month: string; // YYYY-MM format
  year: number;
  // Employee Info (snapshot at time of slip generation)
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  uanNumber?: string;
  esicNumber?: string;
  joiningDate?: string;
  // Salary Summary
  actualGross: number;
  earnedGross: number;
  totalDeductions: number;
  netSalary: number;
  // Leave Summary
  plTotalLeaveInAccount?: number;
  plLeaveAvailed?: number;
  plSubsistingLeave?: number;
  clTotalLeaveInAccount?: number;
  clLeaveAvailed?: number;
  clSubsistingLeave?: number;
  slTotalLeaveInAccount?: number;
  slLeaveAvailed?: number;
  slSubsistingLeave?: number;
  // Metadata
  generatedAt: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const salarySlipRecordSchema = new Schema<ISalarySlipRecord>(
  {
    employeeId: { type: String, required: true },
    salaryRecordId: { type: String, required: true },
    leaveRecordId: String,
    month: { type: String, required: true },
    year: { type: Number, required: true },
    // Employee Info
    employeeName: { type: String, required: true },
    employeeCode: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    uanNumber: String,
    esicNumber: String,
    joiningDate: String,
    // Salary Summary
    actualGross: { type: Number, required: true },
    earnedGross: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    // Leave Summary
    plTotalLeaveInAccount: Number,
    plLeaveAvailed: Number,
    plSubsistingLeave: Number,
    clTotalLeaveInAccount: Number,
    clLeaveAvailed: Number,
    clSubsistingLeave: Number,
    slTotalLeaveInAccount: Number,
    slLeaveAvailed: Number,
    slSubsistingLeave: Number,
    // Metadata
    generatedAt: { type: Date, default: Date.now },
    pdfUrl: String,
  },
  { timestamps: true }
);

// Create compound index for employeeId and month
salarySlipRecordSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const SalarySlipRecord =
  mongoose.models.SalarySlipRecord ||
  mongoose.model<ISalarySlipRecord>("SalarySlipRecord", salarySlipRecordSchema);
