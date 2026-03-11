import { Router, RequestHandler } from "express";
import { ITAccount } from "../models/ITAccount";

const router = Router();

// Get all IT accounts
const getITAccounts: RequestHandler = async (_req, res) => {
  try {
    const accounts = await ITAccount.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: accounts,
      count: accounts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch IT accounts",
    });
  }
};

// Get IT account by ID
const getITAccountById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await ITAccount.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "IT account not found",
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch IT account",
    });
  }
};

// Get IT account by employee ID
const getITAccountByEmployeeId: RequestHandler = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const account = await ITAccount.findOne({ employeeId });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "IT account not found for this employee",
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch IT account by employee ID",
    });
  }
};

// Create IT account
const createITAccount: RequestHandler = async (req, res) => {
  try {
    const accountData = req.body;
    console.log("Creating IT account for systemId:", accountData.systemId);

    // Check if account with same system ID already exists
    if (accountData.systemId) {
      const existing = await ITAccount.findOne({
        systemId: accountData.systemId,
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "IT account with this system ID already exists",
        });
      }
    }

    const account = new ITAccount(accountData);
    await account.save();
    console.log("IT account created successfully:", account._id);

    res.status(201).json({
      success: true,
      data: account,
      message: "IT account created successfully",
    });
  } catch (error) {
    console.error("Error creating IT account:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create IT account",
    });
  }
};

// Update IT account
const updateITAccount: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const account = await ITAccount.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "IT account not found",
      });
    }

    res.json({
      success: true,
      data: account,
      message: "IT account updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update IT account",
    });
  }
};

// Delete IT account
const deleteITAccount: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await ITAccount.findByIdAndDelete(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "IT account not found",
      });
    }

    res.json({
      success: true,
      data: account,
      message: "IT account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete IT account",
    });
  }
};

// Get IT accounts by department
const getITAccountsByDepartment: RequestHandler = async (req, res) => {
  try {
    const { department } = req.params;

    const accounts = await ITAccount.find({ department });

    res.json({
      success: true,
      data: accounts,
      count: accounts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch IT accounts by department",
    });
  }
};

// Get IT accounts by status
const getITAccountsByStatus: RequestHandler = async (req, res) => {
  try {
    const { status } = req.params;

    const accounts = await ITAccount.find({ status });

    res.json({
      success: true,
      data: accounts,
      count: accounts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch IT accounts by status",
    });
  }
};

router.get("/", getITAccounts);
router.post("/", createITAccount);
router.get("/employee/:employeeId", getITAccountByEmployeeId);
router.get("/department/:department", getITAccountsByDepartment);
router.get("/status/:status", getITAccountsByStatus);
router.get("/:id", getITAccountById);
router.put("/:id", updateITAccount);
router.delete("/:id", deleteITAccount);

export { router as itAccountsRouter };
