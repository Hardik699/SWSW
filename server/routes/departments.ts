import { Router, RequestHandler } from "express";
import { Department } from "../models/Department";

const router = Router();

// Get all departments
const getDepartments: RequestHandler = async (_req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({
      success: true,
      data: departments,
      count: departments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch departments",
    });
  }
};

// Get department by ID
const getDepartmentById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch department",
    });
  }
};

// Create department
const createDepartment: RequestHandler = async (req, res) => {
  try {
    const { name, manager } = req.body;

    // Check if department with same name already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Department with this name already exists",
      });
    }

    const department = new Department({
      name,
      manager,
      employeeCount: 0,
    });

    await department.save();

    res.status(201).json({
      success: true,
      data: department,
      message: "Department created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create department",
    });
  }
};

// Update department
const updateDepartment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const department = await Department.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    res.json({
      success: true,
      data: department,
      message: "Department updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update department",
    });
  }
};

// Delete department
const deleteDepartment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    res.json({
      success: true,
      data: department,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete department",
    });
  }
};

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export { router as departmentsRouter };
