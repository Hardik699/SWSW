import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  bloodGroup: string;
  mobileNumber: string;
  emergencyMobileNumber: string;
  alternativeMobileNumber: string;
  email: string;
  address: string;
  permanentAddress: string;
  photo?: string;

  // Job Information
  joiningDate: string;
  department: string;
  position: string;
  tableNumber: string;

  // Banking Details
  accountNumber: string;
  ifscCode: string;
  bankPassbook?: string;
  aadhaarNumber: string;
  panNumber: string;
  uanNumber: string;
  uanSkipReason?: string;
  salary: string;

  // Documents
  aadhaarCard?: string;
  panCard?: string;
  passport?: string;
  drivingLicense?: string;
  resume?: string;
  medicalCertificate?: string;
  educationCertificate?: string;
  experienceLetter?: string;

  status: "active" | "inactive";
  deactivationReason?: string;
  resignationLetter?: string;
  deactivationDate?: string;

  // PF Details
  pf?: string;
  employerPf?: string;
  esic?: string;
  pt?: string;
  tds?: string;
  advanceAny?: string;
  retention?: string;
  retentionType?: "Retention" | "Deduction";

  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fatherName: String,
    motherName: String,
    birthDate: String,
    bloodGroup: String,
    mobileNumber: { type: String, required: true },
    emergencyMobileNumber: String,
    alternativeMobileNumber: String,
    email: { type: String, required: true, unique: true },
    address: String,
    permanentAddress: String,
    photo: String,

    joiningDate: String,
    department: { type: String, required: true },
    position: String,
    tableNumber: String,

    accountNumber: String,
    ifscCode: String,
    bankPassbook: String,
    aadhaarNumber: { type: String, unique: true, sparse: true },
    panNumber: { type: String, unique: true, sparse: true },
    uanNumber: { type: String, unique: true, sparse: true },
    uanSkipReason: String,
    salary: String,

    aadhaarCard: String,
    panCard: String,
    passport: String,
    drivingLicense: String,
    resume: String,
    medicalCertificate: String,
    educationCertificate: String,
    experienceLetter: String,

    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deactivationReason: String,
    resignationLetter: String,
    deactivationDate: String,

    pf: String,
    employerPf: String,
    esic: String,
    pt: String,
    tds: String,
    advanceAny: String,
    retention: String,
    retentionType: { type: String, enum: ["Retention", "Deduction"], default: "Retention" },
  },
  { timestamps: true },
);

// Handle duplicate key error formatting
employeeSchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const newError = new Error(`Employee with this ${field} already exists`);
    next(newError);
  } else {
    next(error);
  }
});

export const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", employeeSchema);
