import { Router, RequestHandler } from "express";
import { Employee } from "../models/Employee";

const router = Router();

// Get all employees
const getEmployees: RequestHandler = async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch employees",
    });
  }
};

// Get employee by ID
const getEmployeeById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch employee",
    });
  }
};

// Create employee
const createEmployee: RequestHandler = async (req, res) => {
  try {
    const employeeData = req.body;

    // Check if employee with same email already exists
    const existing = await Employee.findOne({ email: employeeData.email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Employee with this email already exists",
      });
    }

    const employee = new Employee(employeeData);
    await employee.save();

    res.status(201).json({
      success: true,
      data: employee,
      message: "Employee created successfully",
    });
  } catch (error) {
    let errorMessage = "Failed to create employee";

    if (error instanceof Error) {
      // Handle MongoDB duplicate key errors
      if (error.message.includes("E11000")) {
        const match = error.message.match(/index: (\w+)_1/);
        const field = match ? match[1] : "unknown field";
        errorMessage = `Duplicate value for ${field}. This value already exists in the system.`;
      } else {
        errorMessage = error.message;
      }
      console.error("Employee creation error:", error.message);
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

// Update employee
const updateEmployee: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    let errorMessage = "Failed to update employee";

    if (error instanceof Error) {
      // Handle MongoDB duplicate key errors
      if (
        error.message.includes("E11000") ||
        error.message.includes("already exists")
      ) {
        const match =
          error.message.match(/index: (\w+)_1/) ||
          error.message.match(/(\w+) already exists/);
        const field = match ? match[1] : "unknown field";
        errorMessage = `Duplicate value for ${field}. This value already exists in the system.`;
      } else {
        errorMessage = error.message;
      }
      console.error("Employee update error:", error.message);
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

// Delete employee
const deleteEmployee: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employee,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete employee",
    });
  }
};

// Get employees by department
const getEmployeesByDepartment: RequestHandler = async (req, res) => {
  try {
    const { department } = req.params;

    const employees = await Employee.find({ department });

    res.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch employees by department",
    });
  }
};

// Get employees by status
const getEmployeesByStatus: RequestHandler = async (req, res) => {
  try {
    const { status } = req.params;

    const employees = await Employee.find({ status });

    res.json({
      success: true,
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch employees by status",
    });
  }
};

router.get("/", getEmployees);
router.get("/department/:department", getEmployeesByDepartment);
router.get("/status/:status", getEmployeesByStatus);
router.get("/:id", getEmployeeById);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export { router as employeesRouter };
