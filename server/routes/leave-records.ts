import { Router, RequestHandler } from "express";
import { LeaveRecord } from "../models/LeaveRecord";
import { Employee } from "../models/Employee";

const router = Router();

// Get all leave records
const getLeaveRecords: RequestHandler = async (_req, res) => {
  try {
    const records = await LeaveRecord.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch leave records",
    });
  }
};

// Get leave records by employee ID
const getLeaveRecordsByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year as string;

    let query: any = { employeeId };
    if (year) {
      query.year = parseInt(year, 10);
    }

    const records = await LeaveRecord.find(query).sort({ month: -1 });

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch leave records by employee",
    });
  }
};

// Get leave records by month and year
const getLeaveRecordsByMonth: RequestHandler = async (req, res) => {
  try {
    const { month, year } = req.params;

    const records = await LeaveRecord.find({
      month,
      year: parseInt(year, 10),
    });

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch leave records by month",
    });
  }
};

// Create leave record
const createLeaveRecord: RequestHandler = async (req, res) => {
  try {
    const recordData = req.body;

    const record = new LeaveRecord(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      data: record,
      message: "Leave record created successfully",
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: `A leave record already exists for employee ${recordData.employeeId} in ${recordData.month}. Please update the existing record instead.`,
        isDuplicate: true,
      });
    }

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create leave record",
    });
  }
};

// Update leave record
const updateLeaveRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const record = await LeaveRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Leave record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Leave record updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update leave record",
    });
  }
};

// Delete leave record
const deleteLeaveRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LeaveRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Leave record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Leave record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete leave record",
    });
  }
};

// Bulk upload leave records
const bulkUploadLeaveRecords: RequestHandler = async (req, res) => {
  try {
    const { records, month, year } = req.body;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: "Invalid records format" });
    }

    for (const row of records) {
      try {
        // Find employee by ID or UAN Number
        const id = row.ID || row.id;
        const uan = row["UAN Number"] || row.uanNumber;

        let employee = null;
        if (id) {
          employee = await Employee.findOne({ employeeId: String(id) });
        }
        if (!employee && uan) {
          employee = await Employee.findOne({ uanNumber: String(uan) });
        }

        if (!employee) {
          results.failed++;
          results.errors.push({
            row: row.Name || row.id || "Unknown",
            error: `Employee not found (ID: ${id}, UAN: ${uan})`,
          });
          continue;
        }

        // Map fields based on Excel column names to salary slip field names
        const recordData: any = {
          employeeId: employee._id.toString(),
          month: month || new Date().toISOString().substring(0, 7),
          year: year || new Date().getFullYear(),

          // Paid Leave (PL)
          plTotalLeaveInAccount: parseFloat(row["PL Total Leave In The Account"]) || parseFloat(row["Total Leave In The Account (PL)"]) || 0,
          plLeaveAvailed: parseFloat(row["PL TOTAL LEAVE TAKEN"]) || parseFloat(row["TOTAL LEAVE TAKEN (PL)"]) || 0,
          plSubsistingLeave: parseFloat(row["PL LEAVE BALANCE"]) || parseFloat(row["LEAVE BALANCE (PL)"]) || 0,
          plLwp: parseFloat(row["PL LWP"]) || parseFloat(row["LWP (PL)"]) || 0,

          // Casual Leave (CL)
          clTotalLeaveInAccount: parseFloat(row["CL Total Leave In The Account"]) || parseFloat(row["Total Leave In The Account (CL)"]) || 0,
          clLeaveAvailed: parseFloat(row["CL TOTAL LEAVE TAKEN"]) || parseFloat(row["TOTAL LEAVE TAKEN (CL)"]) || 0,
          clSubsistingLeave: parseFloat(row["CL LEAVE BALANCE"]) || parseFloat(row["LEAVE BALANCE (CL)"]) || 0,
          clLwp: parseFloat(row["CL LWP"]) || parseFloat(row["LWP (CL)"]) || 0,

          // Sick Leave (SL)
          slTotalLeaveInAccount: parseFloat(row["SL Total Leave In The Account"]) || parseFloat(row["Total Leave In The Account (SL)"]) || 0,
          slLeaveAvailed: parseFloat(row["SL TOTAL LEAVE TAKEN"]) || parseFloat(row["TOTAL LEAVE TAKEN (SL)"]) || 0,
          slSubsistingLeave: parseFloat(row["SL LEAVE BALANCE"]) || parseFloat(row["LEAVE BALANCE (SL)"]) || 0,
          slLwp: parseFloat(row["SL LWP"]) || parseFloat(row["LWP (SL)"]) || 0,
        };

        // Save or update
        await LeaveRecord.findOneAndUpdate(
          { employeeId: recordData.employeeId, month: recordData.month },
          recordData,
          { upsert: true, new: true }
        );

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: row.Name || row.id || "Unknown",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Bulk upload failed",
    });
  }
};

router.post("/", createLeaveRecord);
router.post("/bulk-upload", bulkUploadLeaveRecords);
router.get("/", getLeaveRecords);
router.get("/employee/:employeeId", getLeaveRecordsByEmployeeId);
router.get("/month/:month/:year", getLeaveRecordsByMonth);
router.delete("/:id", deleteLeaveRecord);
router.put("/:id", updateLeaveRecord);

export { router as leaveRecordsRouter };
