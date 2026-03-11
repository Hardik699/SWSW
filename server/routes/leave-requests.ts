import { Router, RequestHandler } from "express";
import { LeaveRequest } from "../models/LeaveRequest";

const router = Router();

// Get all leave requests
const getLeaveRequests: RequestHandler = async (_req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch leave requests",
    });
  }
};

// Get leave request by ID
const getLeaveRequestById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await LeaveRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Leave request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch leave request",
    });
  }
};

// Get leave requests by employee ID
const getLeaveRequestsByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const status = req.query.status as string;

    let query: any = { employeeId };
    if (status) {
      query.status = status;
    }

    const requests = await LeaveRequest.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch leave requests by employee",
    });
  }
};

// Get leave requests by status
const getLeaveRequestsByStatus: RequestHandler = async (req, res) => {
  try {
    const { status } = req.params;

    const requests = await LeaveRequest.find({ status }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch leave requests by status",
    });
  }
};

// Create leave request
const createLeaveRequest: RequestHandler = async (req, res) => {
  try {
    const requestData = req.body;

    const request = new LeaveRequest(requestData);
    await request.save();

    res.status(201).json({
      success: true,
      data: request,
      message: "Leave request created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create leave request",
    });
  }
};

// Update leave request
const updateLeaveRequest: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const request = await LeaveRequest.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Leave request not found",
      });
    }

    res.json({
      success: true,
      data: request,
      message: "Leave request updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update leave request",
    });
  }
};

// Delete leave request
const deleteLeaveRequest: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await LeaveRequest.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Leave request not found",
      });
    }

    res.json({
      success: true,
      data: request,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete leave request",
    });
  }
};

router.get("/", getLeaveRequests);
router.get("/employee/:employeeId", getLeaveRequestsByEmployeeId);
router.get("/status/:status", getLeaveRequestsByStatus);
router.get("/:id", getLeaveRequestById);
router.post("/", createLeaveRequest);
router.put("/:id", updateLeaveRequest);
router.delete("/:id", deleteLeaveRequest);

export { router as leaveRequestsRouter };
