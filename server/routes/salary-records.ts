import { Router, RequestHandler } from "express";
import { SalaryRecord } from "../models/SalaryRecord";
import { Employee } from "../models/Employee";

const router = Router();

// Get all salary records
const getSalaryRecords: RequestHandler = async (_req, res) => {
  try {
    const records = await SalaryRecord.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch salary records",
    });
  }
};

// Get salary record by ID
const getSalaryRecordById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await SalaryRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch salary record",
    });
  }
};

// Get salary records by employee ID
const getSalaryRecordsByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year as string;

    let query: any = { employeeId };
    if (year) {
      query.year = parseInt(year, 10);
    }

    const records = await SalaryRecord.find(query).sort({ month: -1 });

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
          : "Failed to fetch salary records by employee",
    });
  }
};

// Get salary records by month and year
const getSalaryRecordsByMonth: RequestHandler = async (req, res) => {
  try {
    const { month, year } = req.params;

    const records = await SalaryRecord.find({
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
          : "Failed to fetch salary records by month",
    });
  }
};

// Create salary record
const createSalaryRecord: RequestHandler = async (req, res) => {
  try {
    const recordData = req.body;
    
    console.log('=== SERVER: Creating Salary Record ===');
    console.log('Received data:', JSON.stringify(recordData, null, 2));
    console.log('Leave fields:', {
      plTotal: recordData.plTotal,
      plAvailed: recordData.plAvailed,
      plSubsisting: recordData.plSubsisting,
      plLwp: recordData.plLwp,
      clTotal: recordData.clTotal,
      clAvailed: recordData.clAvailed,
      clSubsisting: recordData.clSubsisting,
      clLwp: recordData.clLwp,
      slTotal: recordData.slTotal,
      slAvailed: recordData.slAvailed,
      slSubsisting: recordData.slSubsisting,
      slLwp: recordData.slLwp,
      lwp: recordData.lwp
    });

    const record = new SalaryRecord(recordData);
    await record.save();
    
    console.log('=== SERVER: Record Saved Successfully ===');
    console.log('Saved record ID:', record._id);
    console.log('Saved leave data:', {
      plTotal: record.plTotal,
      plAvailed: record.plAvailed,
      plSubsisting: record.plSubsisting,
      plLwp: record.plLwp,
      clTotal: record.clTotal,
      clAvailed: record.clAvailed,
      clSubsisting: record.clSubsisting,
      clLwp: record.clLwp,
      slTotal: record.slTotal,
      slAvailed: record.slAvailed,
      slSubsisting: record.slSubsisting,
      slLwp: record.slLwp,
      lwp: record.lwp
    });

    res.status(201).json({
      success: true,
      data: record,
      message: "Salary record created successfully",
    });
  } catch (error: any) {
    console.error('=== SERVER: Save Failed ===', error);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: `A salary record already exists for employee ${recordData.employeeId} in ${recordData.month}. Please update the existing record instead.`,
        isDuplicate: true,
      });
    }

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create salary record",
    });
  }
};

// Update salary record
const updateSalaryRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('=== SERVER: Updating Salary Record ===');
    console.log('Record ID:', id);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    console.log('Leave fields in update:', {
      plTotal: updateData.plTotal,
      plAvailed: updateData.plAvailed,
      plSubsisting: updateData.plSubsisting,
      plLwp: updateData.plLwp,
      clTotal: updateData.clTotal,
      clAvailed: updateData.clAvailed,
      clSubsisting: updateData.clSubsisting,
      clLwp: updateData.clLwp,
      slTotal: updateData.slTotal,
      slAvailed: updateData.slAvailed,
      slSubsisting: updateData.slSubsisting,
      slLwp: updateData.slLwp,
      lwp: updateData.lwp
    });

    const record = await SalaryRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary record not found",
      });
    }

    console.log('=== SERVER: Record Updated Successfully ===');
    console.log('Updated record ID:', record._id);
    console.log('Updated leave data:', {
      plTotal: record.plTotal,
      plAvailed: record.plAvailed,
      plSubsisting: record.plSubsisting,
      plLwp: record.plLwp,
      clTotal: record.clTotal,
      clAvailed: record.clAvailed,
      clSubsisting: record.clSubsisting,
      clLwp: record.clLwp,
      slTotal: record.slTotal,
      slAvailed: record.slAvailed,
      slSubsisting: record.slSubsisting,
      slLwp: record.slLwp,
      lwp: record.lwp
    });

    res.json({
      success: true,
      data: record,
      message: "Salary record updated successfully",
    });
  } catch (error) {
    console.error('=== SERVER: Update Failed ===', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update salary record",
    });
  }
};

// Delete salary record
const deleteSalaryRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await SalaryRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Salary record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete salary record",
    });
  }
};

// Bulk upload salary records
const bulkUploadSalaryRecords: RequestHandler = async (req, res) => {
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

        // Map fields
        const recordData: any = {
          employeeId: employee.id, // Internal DB ID or employeeId? Based on SalaryRecord model it's employeeId
          month: month || row.Month || new Date().toISOString().substring(0, 7),
          year: year || parseInt(row.Year) || new Date().getFullYear(),
          totalWorkingDays: parseInt(row["Total Days"]) || 30,
          actualWorkingDays: parseInt(row["Days Worked"]) || 0,

          // Earnings (Actual Gross)
          basic: parseFloat(row["Actual Basic"]) || 0,
          hra: parseFloat(row["Actual HRA"]) || 0,
          conveyance: parseFloat(row["Actual Conveyance"]) || 0,
          specialAllowance: parseFloat(row["Actual Spl Allowance"]) || 0,
          actualGross: parseFloat(row["Actual Payable Gross"]) || 0,
          bonus: parseFloat(row.Bonus) || 0,
          advanceAny: parseFloat(row["Advance Any"]) || 0,

          // Earnings (Earned Gross)
          basicEarned: parseFloat(row["Earned Basic"]) || 0,
          hraEarned: parseFloat(row["Earned HRA"]) || 0,
          conveyanceEarned: parseFloat(row["Earned Conveyance"]) || 0,
          specialAllowanceEarned: parseFloat(row["Earned Spl Allowance"]) || 0,
          earnedGross: parseFloat(row["Earned GROSS Payable"] || row["Earned GROSS"]) || 0,
          incentiveEarned: parseFloat(row.Incentive1) || 0,
          adjustmentEarned: parseFloat(row.Adjustment) || 0,

          // Deductions
          pf: parseFloat(row["PF Info"] || row.PF) || 0,
          esic: parseFloat(row["ESIC info"] || row.ESIC) || 0,
          pt: parseFloat(row.PT) || 0,
          tds: parseFloat(row.TDS) || 0,
          retention: parseFloat(row["Retention Deduction"] || row.Retention) || 0,
          deductions: parseFloat(row["Total Deduction"]) || 0,

          // Totals
          netSalary: parseFloat(row["Salary Paid"] || row["Net Salary"]) || 0,
          totalSalary: parseFloat(row["Salary Paid"] || row["Net Salary"]) || 0, // Fallback for backward compatibility
        };

        // Use internal employee._id if model expects it (checking models/SalaryRecord.ts:2, ISalaryRecord has employeeId: string)
        // Usually, in this app employeeId refers to EMP-001 etc, let's keep it consistent with what the app uses.
        // EmployeeDetailsPage uses e.id which is emp._id.
        recordData.employeeId = employee._id.toString();

        // Save or update
        await SalaryRecord.findOneAndUpdate(
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

router.post("/", createSalaryRecord);
router.post("/bulk-upload", bulkUploadSalaryRecords);
router.get("/", getSalaryRecords);
router.get("/employee/:employeeId", getSalaryRecordsByEmployeeId);
router.get("/month/:month/:year", getSalaryRecordsByMonth);
router.get("/:id", getSalaryRecordById);
router.put("/:id", updateSalaryRecord);
router.delete("/:id", deleteSalaryRecord);

export { router as salaryRecordsRouter };
