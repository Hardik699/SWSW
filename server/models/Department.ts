import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  manager: string;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    manager: String,
    employeeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Department =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", departmentSchema);
