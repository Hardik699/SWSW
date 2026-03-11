import mongoose, { Schema, Document } from "mongoose";

export interface ILeaveRecord extends Document {
  employeeId: string;
  month: string; // YYYY-MM format
  year: number;
  // Paid Leave (PL) - Maps to leave sheet columns
  plTotalLeaveInAccount?: number; // "PL Total Leave In The Account"
  plLeaveAvailed?: number;         // "PL TOTAL LEAVE TAKEN"
  plSubsistingLeave?: number;      // "PL LEAVE BALANCE"
  plLwp?: number;                  // "PL LWP"
  // Casual Leave (CL) - Maps to leave sheet columns
  clTotalLeaveInAccount?: number; // "CL Total Leave In The Account"
  clLeaveAvailed?: number;         // "CL TOTAL LEAVE TAKEN"
  clSubsistingLeave?: number;      // "CL LEAVE BALANCE"
  clLwp?: number;                  // "CL LWP"
  // Sick Leave (SL) - Maps to leave sheet columns
  slTotalLeaveInAccount?: number; // "SL Total Leave In The Account"
  slLeaveAvailed?: number;         // "SL TOTAL LEAVE TAKEN"
  slSubsistingLeave?: number;      // "SL LEAVE BALANCE"
  slLwp?: number;                  // "SL LWP"
  createdAt: Date;
  updatedAt: Date;
}

const leaveRecordSchema = new Schema<ILeaveRecord>(
  {
    employeeId: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    // Paid Leave (PL)
    plTotalLeaveInAccount: Number,
    plLeaveAvailed: Number,
    plSubsistingLeave: Number,
    // Casual Leave (CL)
    clTotalLeaveInAccount: Number,
    clLeaveAvailed: Number,
    clSubsistingLeave: Number,
    // Sick Leave (SL)
    slTotalLeaveInAccount: Number,
    slLeaveAvailed: Number,
    slSubsistingLeave: Number,
    // Leave Without Pay (LWP)
    plLwp: Number,
    clLwp: Number,
    slLwp: Number,
  },
  { timestamps: true }
);

// Create compound index for employeeId and month
leaveRecordSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const LeaveRecord =
  mongoose.models.LeaveRecord ||
  mongoose.model<ILeaveRecord>("LeaveRecord", leaveRecordSchema);
