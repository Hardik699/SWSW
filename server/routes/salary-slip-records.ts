import { Router, RequestHandler } from "express";
import { SalarySlipRecord } from "../models/SalarySlipRecord";

const router = Router();

// Get all salary slip records
const getSalarySlipRecords: RequestHandler = async (_req, res) => {
  try {
    const records = await SalarySlipRecord.find().sort({ generatedAt: -1 });
    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch salary slip records",
    });
  }
};

// Get salary slip records by employee ID
const getSalarySlipRecordsByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year as string;

    let query: any = { employeeId };
    if (year) {
      query.year = parseInt(year, 10);
    }

    const records = await SalarySlipRecord.find(query).sort({ month: -1 });

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
          : "Failed to fetch salary slip records by employee",
    });
  }
};

// Get salary slip records by month and year
const getSalarySlipRecordsByMonth: RequestHandler = async (req, res) => {
  try {
    const { month, year } = req.params;

    const records = await SalarySlipRecord.find({
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
          : "Failed to fetch salary slip records by month",
    });
  }
};

// Get single salary slip record
const getSalarySlipRecordById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await SalarySlipRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary slip record not found",
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
          : "Failed to fetch salary slip record",
    });
  }
};

// Create salary slip record
const createSalarySlipRecord: RequestHandler = async (req, res) => {
  try {
    const recordData = req.body;

    const record = new SalarySlipRecord(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      data: record,
      message: "Salary slip record created successfully",
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: `A salary slip already exists for employee ${recordData.employeeId} in ${recordData.month}. Please update the existing record instead.`,
        isDuplicate: true,
      });
    }

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create salary slip record",
    });
  }
};

// Update salary slip record
const updateSalarySlipRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const record = await SalarySlipRecord.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary slip record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Salary slip record updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update salary slip record",
    });
  }
};

// Delete salary slip record
const deleteSalarySlipRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await SalarySlipRecord.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Salary slip record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Salary slip record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete salary slip record",
    });
  }
};

router.post("/", createSalarySlipRecord);
router.get("/", getSalarySlipRecords);
router.get("/employee/:employeeId", getSalarySlipRecordsByEmployeeId);
router.get("/month/:month/:year", getSalarySlipRecordsByMonth);
router.get("/:id", getSalarySlipRecordById);
router.put("/:id", updateSalarySlipRecord);
router.delete("/:id", deleteSalarySlipRecord);

export { router as salarySlipRecordsRouter };
