import { Router, RequestHandler } from "express";
import { User } from "../models/User";
import { SalaryRecord } from "../models/SalaryRecord";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Seed default users if they don't exist
export const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log("Seeding default users...");
      const defaultUsers = [
        { username: "admin", password: "123", role: "admin" },
        { username: "it", password: "123", role: "it" },
        { username: "hr", password: "123", role: "hr" },
        { username: "hardik", password: "123", role: "hr" },
        { username: "it1", password: "123", role: "admin" },
      ];
      await User.insertMany(defaultUsers);
      console.log("Default users seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

// Seed sample salary records
export const seedSalaryRecords = async () => {
  try {
    const count = await SalaryRecord.countDocuments();
    if (count === 0) {
      console.log("Seeding sample salary records...");
      // Using the employee ID from the screenshot
      const defaultSalaryRecords = [
        {
          employeeId: "699f25b508838b1b788dd5e4",
          month: "2024-01",
          year: 2024,
          totalWorkingDays: 26,
          actualWorkingDays: 26,
          basicSalary: 50000,
          bonus: 5000,
          deductions: 3500,
          totalSalary: 51500,
          paymentDate: "2024-02-05",
          notes: "January salary payment",
        },
        {
          employeeId: "699f25b508838b1b788dd5e4",
          month: "2024-02",
          year: 2024,
          totalWorkingDays: 29,
          actualWorkingDays: 28,
          basicSalary: 50000,
          bonus: 0,
          deductions: 3500,
          totalSalary: 46500,
          paymentDate: "2024-03-05",
          notes: "February salary payment - 1 day leave",
        },
      ];
      await SalaryRecord.insertMany(defaultSalaryRecords);
      console.log("Sample salary records seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding salary records:", error);
  }
};

// Login endpoint
const login: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    res.json({
      success: true,
      data: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Change password endpoint
const changePassword: RequestHandler = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== oldPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Create new user (admin only)
const createUser: RequestHandler = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    if (!role || !["admin", "it", "hr"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be one of: admin, it, hr",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this username already exists",
      });
    }

    // Create new user
    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({
      success: true,
      data: {
        username: newUser.username,
        role: newUser.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Create user without auth requirement (for admin setup only - can be removed in production)
const createUserSetup: RequestHandler = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const setupToken = req.header("x-setup-token");

    // Simple setup token check
    if (setupToken !== "setup2024") {
      return res.status(401).json({
        success: false,
        error: "Invalid setup token",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    if (!role || !["admin", "it", "hr"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be one of: admin, it, hr",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this username already exists",
      });
    }

    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({
      success: true,
      data: {
        username: newUser.username,
        role: newUser.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/create-user", requireAdmin, createUser);
router.post("/setup/create-user", createUserSetup);

export { router as authRouter };
