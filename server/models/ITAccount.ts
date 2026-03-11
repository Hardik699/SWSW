import mongoose, { Schema, Document } from "mongoose";

export interface IITAccount extends Document {
  employeeId: string;
  employeeName: string;
  systemId: string;
  tableNumber: string;
  department: string;
  emails: Array<{ email: string; password: string }>;
  vitelGlobal: {
    id?: string;
    provider?: "vitel" | "vonage";
    type?: string;
    extNumber?: string;
    password?: string;
  };
  lmPlayer: { id: string; password: string; license: string };
  notes?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const itAccountSchema = new Schema<IITAccount>(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    systemId: { type: String, required: true, unique: true },
    tableNumber: String,
    department: String,
    emails: [
      {
        provider: { type: String },
        providerCustom: { type: String },
        email: { type: String, required: true },
        password: { type: String },
      },
    ],
    vitelGlobal: {
      id: { type: String },
      provider: { type: String, enum: ["vitel", "vonage"] },
      type: { type: String },
      extNumber: { type: String },
      password: { type: String },
    },
    lmPlayer: {
      id: { type: String, required: false },
      password: { type: String, required: false },
      license: { type: String },
    },
    notes: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Force model re-registration in development to pick up schema changes
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.ITAccount;
}

export const ITAccount =
  mongoose.models.ITAccount ||
  mongoose.model<IITAccount>("ITAccount", itAccountSchema);
