import { Router, RequestHandler } from "express";
import { SystemAsset } from "../models/SystemAsset";

const router = Router();

// Get all system assets
const getSystemAssets: RequestHandler = async (_req, res) => {
  try {
    const assets = await SystemAsset.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch system assets",
    });
  }
};

// Get system assets by category
const getAssetsByCategory: RequestHandler = async (req, res) => {
  try {
    const { category } = req.params;
    const assets = await SystemAsset.find({ category }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assets by category",
    });
  }
};

// Get system asset by ID
const getAssetById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await SystemAsset.findOne({ id });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "System asset not found",
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch system asset",
    });
  }
};

// Create system asset
const createSystemAsset: RequestHandler = async (req, res) => {
  try {
    const assetData = req.body;

    // Check if asset with same ID already exists
    const existing = await SystemAsset.findOne({ id: assetData.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "System asset with this ID already exists",
      });
    }

    const asset = new SystemAsset(assetData);
    await asset.save();

    res.status(201).json({
      success: true,
      data: asset,
      message: "System asset created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create system asset",
    });
  }
};

// Create multiple system assets
const createMultipleSystemAssets: RequestHandler = async (req, res) => {
  try {
    const assetsData = req.body;

    if (!Array.isArray(assetsData)) {
      return res.status(400).json({
        success: false,
        error: "Request body must be an array of assets",
      });
    }

    // Filter out assets that already exist
    const existingIds = await SystemAsset.find({
      id: { $in: assetsData.map((a) => a.id) },
    }).select("id");

    const existingIdSet = new Set(existingIds.map((a) => a.id));
    const newAssets = assetsData.filter((a) => !existingIdSet.has(a.id));

    if (newAssets.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "All assets already exist in the system",
      });
    }

    const created = await SystemAsset.insertMany(newAssets);

    res.status(201).json({
      success: true,
      data: created,
      message: `${created.length} system assets created successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create system assets",
    });
  }
};

// Update system asset
const updateSystemAsset: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const asset = await SystemAsset.findOneAndUpdate({ id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "System asset not found",
      });
    }

    res.json({
      success: true,
      data: asset,
      message: "System asset updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update system asset",
    });
  }
};

// Delete system asset
const deleteSystemAsset: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await SystemAsset.findOneAndDelete({ id });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "System asset not found",
      });
    }

    res.json({
      success: true,
      data: asset,
      message: "System asset deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete system asset",
    });
  }
};

router.get("/", getSystemAssets);
router.get("/category/:category", getAssetsByCategory);
router.get("/:id", getAssetById);
router.post("/", createSystemAsset);
router.post("/bulk/create", createMultipleSystemAssets);
router.put("/:id", updateSystemAsset);
router.delete("/:id", deleteSystemAsset);

export { router as systemAssetsRouter };
