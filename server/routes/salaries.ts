import { RequestHandler, Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { Salary } from "../models/Salary";
import { SalaryDocument as SalaryDocModel } from "../models/SalaryDocument";
import {
  CreateSalaryInput,
  ListDocumentsResponse,
  ListSalariesResponse,
  SalaryDocument,
  SalaryRecord,
  SalaryWithDocs,
  UpdateSalaryInput,
} from "@shared/api";
import { requireAdmin } from "../middleware/auth";

const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const id = nanoid(12);
    const ext =
      path.extname(file.originalname) ||
      "." + (mime.extension(file.mimetype) || "bin");
    cb(null, `${id}${ext}`);
  },
});

const allowedMimes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (allowedMimes.has(file.mimetype)) return cb(null, true);
  cb(new Error("Unsupported file type"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

const createSchema = z.object({
  userId: z.string().min(1),
  employeeName: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1900).max(3000),
  amount: z.number().min(0),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  employeeName: z.string().min(1).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(1900).max(3000).optional(),
  amount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const buildDocUrl = (filename: string) => `/uploads/${filename}`;

// Handlers
const list: RequestHandler = async (req, res) => {
  try {
    const role = req.userRole || "user";
    const userId = req.userId || "anonymous";
    const query = role === "admin" ? {} : { userId };
    const salaries = await Salary.find(query).lean();
    const items: SalaryRecord[] = salaries.map((s) => ({
      id: s.id,
      userId: s.userId,
      employeeName: s.employeeName,
      month: s.month,
      year: s.year,
      amount: s.amount,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
    const resp: ListSalariesResponse = { items };
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch salaries" });
  }
};

const getOne: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findOne({ id }).lean();
    if (!salary) return res.status(404).json({ error: "Not found" });
    const role = req.userRole || "user";
    const userId = req.userId || "anonymous";
    if (role !== "admin" && salary.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const documents = await SalaryDocModel.find({ salaryId: id }).lean();
    const record: SalaryRecord = {
      id: salary.id,
      userId: salary.userId,
      employeeName: salary.employeeName,
      month: salary.month,
      year: salary.year,
      amount: salary.amount,
      notes: salary.notes,
      createdAt: salary.createdAt.toISOString(),
      updatedAt: salary.updatedAt.toISOString(),
    };
    const docs: SalaryDocument[] = documents.map((d) => ({
      id: d.id,
      salaryId: d.salaryId,
      originalName: d.originalName,
      filename: d.filename,
      mimeType: d.mimeType,
      size: d.size,
      url: d.url,
      createdAt: d.createdAt.toISOString(),
    }));
    const full: SalaryWithDocs = { ...record, documents: docs };
    res.json(full);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch salary" });
  }
};

const create: RequestHandler = async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });
    const input = parsed.data as CreateSalaryInput;
    const id = nanoid(12);
    const salary = new Salary({
      id,
      userId: input.userId,
      employeeName: input.employeeName,
      month: input.month,
      year: input.year,
      amount: input.amount,
      notes: input.notes,
    });
    await salary.save();
    const record: SalaryRecord = {
      id: salary.id,
      userId: salary.userId,
      employeeName: salary.employeeName,
      month: salary.month,
      year: salary.year,
      amount: salary.amount,
      notes: salary.notes,
      createdAt: salary.createdAt.toISOString(),
      updatedAt: salary.updatedAt.toISOString(),
    };
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to create salary" });
  }
};

const update: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findOne({ id });
    if (!salary) return res.status(404).json({ error: "Not found" });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });
    const patch = parsed.data as UpdateSalaryInput;
    Object.assign(salary, patch);
    await salary.save();
    const record: SalaryRecord = {
      id: salary.id,
      userId: salary.userId,
      employeeName: salary.employeeName,
      month: salary.month,
      year: salary.year,
      amount: salary.amount,
      notes: salary.notes,
      createdAt: salary.createdAt.toISOString(),
      updatedAt: salary.updatedAt.toISOString(),
    };
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to update salary" });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await Salary.findOne({ id });
    if (!salary) return res.status(404).json({ error: "Not found" });
    await Salary.deleteOne({ id });
    await SalaryDocModel.deleteMany({ salaryId: id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete salary" });
  }
};

const listDocs: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params; // salaryId
    const salary = await Salary.findOne({ id }).lean();
    if (!salary) return res.status(404).json({ error: "Not found" });
    const role = req.userRole || "user";
    const userId = req.userId || "anonymous";
    if (role !== "admin" && salary.userId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    const documents = await SalaryDocModel.find({ salaryId: id }).lean();
    const items: SalaryDocument[] = documents.map((d) => ({
      id: d.id,
      salaryId: d.salaryId,
      originalName: d.originalName,
      filename: d.filename,
      mimeType: d.mimeType,
      size: d.size,
      url: d.url,
      createdAt: d.createdAt.toISOString(),
    }));
    const resp: ListDocumentsResponse = { items };
    res.json(resp);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

const uploadDocs: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params; // salaryId
    const salary = await Salary.findOne({ id });
    if (!salary) return res.status(404).json({ error: "Not found" });
    const role = req.userRole || "user";
    const userId = req.userId || "anonymous";
    if (role !== "admin" && salary.userId !== userId)
      return res.status(403).json({ error: "Forbidden" });

    // Handle both JSON (with URLs from Supabase) and FormData (legacy support)
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const body = req.body as any;
    const fileUrls = body?.fileUrls as
      | Array<{ originalName: string; url: string; mimeType: string }>
      | undefined;

    // Check if we have files or URLs
    if (
      (!files || files.length === 0) &&
      (!fileUrls || fileUrls.length === 0)
    ) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Handle multer files (legacy)
    if (files && files.length > 0) {
      for (const f of files) {
        const doc = new SalaryDocModel({
          id: nanoid(12),
          salaryId: id,
          originalName: f.originalname,
          filename: f.filename,
          mimeType: f.mimetype,
          size: f.size,
          url: buildDocUrl(f.filename),
        });
        await doc.save();
      }
    }

    // Handle Supabase URLs
    if (fileUrls && fileUrls.length > 0) {
      for (const fileUrl of fileUrls) {
        const doc = new SalaryDocModel({
          id: nanoid(12),
          salaryId: id,
          originalName: fileUrl.originalName,
          filename: fileUrl.originalName, // Store original name as filename for Supabase URLs
          mimeType: fileUrl.mimeType,
          size: 0, // Size not available from Supabase URLs
          url: fileUrl.url,
        });
        await doc.save();
      }
    }

    const documents = await SalaryDocModel.find({ salaryId: id }).lean();
    const items: SalaryDocument[] = documents.map((d) => ({
      id: d.id,
      salaryId: d.salaryId,
      originalName: d.originalName,
      filename: d.filename,
      mimeType: d.mimeType,
      size: d.size,
      url: d.url,
      createdAt: d.createdAt.toISOString(),
    }));
    res.status(201).json({ items });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload documents" });
  }
};

const deleteDoc: RequestHandler = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const salary = await Salary.findOne({ id });
    if (!salary) return res.status(404).json({ error: "Not found" });
    await SalaryDocModel.deleteOne({ id: docId, salaryId: id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
};

export function salariesRouter() {
  const router = Router();
  router.get("/", list);
  router.post("/", create);
  router.get("/:id/documents", listDocs);
  router.post("/:id/documents", upload.array("files", 5), uploadDocs);
  router.delete("/:id/documents/:docId", requireAdmin, deleteDoc);
  router.get("/:id", getOne);
  router.put("/:id", requireAdmin, update);
  router.delete("/:id", requireAdmin, remove);
  return router;
}
