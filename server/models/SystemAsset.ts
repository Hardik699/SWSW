import mongoose, { Schema, Document } from "mongoose";

export interface ISystemAsset extends Document {
  id: string;
  category: string;
  serialNumber?: string;
  vendorName?: string;
  companyName?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  vonageNumber?: string;
  vonageExtCode?: string;
  vonagePassword?: string;
  vitelGlobalNumber?: string;
  vitelExt?: string;
  vitelUsername?: string;
  vitelPassword?: string;
  ramSize?: string;
  ramType?: string;
  processorModel?: string;
  storageType?: string;
  storageCapacity?: string;
  createdAt: Date;
  updatedAt: Date;
}

const systemAssetSchema = new Schema<ISystemAsset>(
  {
    id: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    serialNumber: String,
    vendorName: String,
    companyName: String,
    purchaseDate: String,
    warrantyEndDate: String,
    vonageNumber: String,
    vonageExtCode: String,
    vonagePassword: String,
    vitelGlobalNumber: String,
    vitelExt: String,
    vitelUsername: String,
    vitelPassword: String,
    ramSize: String,
    ramType: String,
    processorModel: String,
    storageType: String,
    storageCapacity: String,
  },
  { timestamps: true },
);

export const SystemAsset =
  mongoose.models.SystemAsset ||
  mongoose.model<ISystemAsset>("SystemAsset", systemAssetSchema);
