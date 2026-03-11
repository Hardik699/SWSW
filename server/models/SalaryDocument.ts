import mongoose, { Schema, Document } from "mongoose";

export interface ISalaryDocument extends Document {
  id: string;
  salaryId: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

const salaryDocumentSchema = new Schema<ISalaryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    salaryId: { type: String, required: true, index: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SalaryDocument =
  mongoose.models.SalaryDocument ||
  mongoose.model<ISalaryDocument>("SalaryDocument", salaryDocumentSchema);
