import { Router, RequestHandler } from "express";
import { Attendance } from "../models/Attendance";

const router = Router();

// Get all attendance records
const getAttendanceRecords: RequestHandler = async (_req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch attendance records",
    });
  }
};

// Get attendance by ID
const getAttendanceById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch attendance record",
    });
  }
};

// Get attendance by employee ID
const getAttendanceByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let query: any = { employeeId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const records = await Attendance.find(query).sort({ date: -1 });

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
          : "Failed to fetch attendance records by employee",
    });
  }
};

// Get attendance by date
const getAttendanceByDate: RequestHandler = async (req, res) => {
  try {
    const { date } = req.params;

    const records = await Attendance.find({ date });

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch attendance by date",
    });
  }
};

// Create attendance record
const createAttendanceRecord: RequestHandler = async (req, res) => {
  try {
    const recordData = req.body;

    const record = new Attendance(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      data: record,
      message: "Attendance record created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create attendance record",
    });
  }
};

// Update attendance record
const updateAttendanceRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const record = await Attendance.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Attendance record updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update attendance record",
    });
  }
};

// Delete attendance record
const deleteAttendanceRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Attendance.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      data: record,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete attendance record",
    });
  }
};

router.get("/", getAttendanceRecords);
router.get("/employee/:employeeId", getAttendanceByEmployeeId);
router.get("/date/:date", getAttendanceByDate);
router.get("/:id", getAttendanceById);
router.post("/", createAttendanceRecord);
router.put("/:id", updateAttendanceRecord);
router.delete("/:id", deleteAttendanceRecord);

export { router as attendanceRouter };
