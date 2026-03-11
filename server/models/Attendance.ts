import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: String, required: true },
    date: { type: String, required: true },
    present: { type: Boolean, default: false },
    checkIn: String,
    checkOut: String,
    sl1Start: String,
    sl1End: String,
    sl2Start: String,
    sl2End: String,
    notes: String,
  },
  { timestamps: true }
);

// Create compound index for employeeId and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", attendanceSchema);
