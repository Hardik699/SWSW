import mongoose, { Schema, Document } from "mongoose";

export interface ISalary extends Document {
  id: string;
  userId: string;
  employeeName: string;
  month: number;
  year: number;
  amount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new Schema<ISalary>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    notes: String,
  },
  { timestamps: true }
);

export const Salary =
  mongoose.models.Salary ||
  mongoose.model<ISalary>("Salary", salarySchema);
