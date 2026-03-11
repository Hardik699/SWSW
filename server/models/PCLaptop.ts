import mongoose, { Schema, Document } from "mongoose";

export interface IPCLaptop extends Document {
  id: string;
  systemType?: string;
  totalRam?: string;
  mouseId?: string;
  keyboardId?: string;
  motherboardId?: string;
  cameraId?: string;
  headphoneId?: string;
  powerSupplyId?: string;
  monitorId?: string;
  storageId?: string;
  ramId?: string;
  ramId2?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pcLaptopSchema = new Schema<IPCLaptop>(
  {
    id: { type: String, required: true, unique: true },
    systemType: String,
    totalRam: String,
    mouseId: String,
    keyboardId: String,
    motherboardId: String,
    cameraId: String,
    headphoneId: String,
    powerSupplyId: String,
    monitorId: String,
    storageId: String,
    ramId: String,
    ramId2: String,
  },
  { timestamps: true },
);

export const PCLaptop =
  mongoose.models.PCLaptop ||
  mongoose.model<IPCLaptop>("PCLaptop", pcLaptopSchema);
