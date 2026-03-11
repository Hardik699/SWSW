import { Router, RequestHandler } from "express";
import { Employee } from "../models/Employee";
import { Department } from "../models/Department";
import { Attendance } from "../models/Attendance";
import { LeaveRequest } from "../models/LeaveRequest";
import { SalaryRecord } from "../models/SalaryRecord";
import { ITAccount } from "../models/ITAccount";
import { SystemAsset } from "../models/SystemAsset";
import { Salary } from "../models/Salary";
import { SalaryDocument } from "../models/SalaryDocument";

const router = Router();

// Delete all data from all collections
const clearAllData: RequestHandler = async (_req, res) => {
  try {
    const results = await Promise.allSettled([
      Employee.deleteMany({}).exec(),
      Department.deleteMany({}).exec(),
      Attendance.deleteMany({}).exec(),
      LeaveRequest.deleteMany({}).exec(),
      SalaryRecord.deleteMany({}).exec(),
      ITAccount.deleteMany({}).exec(),
      SystemAsset.deleteMany({}).exec(),
      Salary.deleteMany({}).exec(),
      SalaryDocument.deleteMany({}).exec(),
    ]);

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      return res.status(500).json({
        success: false,
        error: "Some collections failed to clear",
        details: failed.map((f) => (f as PromiseRejectedResult).reason),
      });
    }

    res.json({
      success: true,
      message: "All data cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear data",
    });
  }
};

router.delete("/", clearAllData);

export { router as clearDataRouter };
