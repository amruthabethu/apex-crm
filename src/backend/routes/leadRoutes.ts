import { Router } from "express";
import { LeadController } from "../controllers/leadController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Secure all lead management routes using our JWT Auth Middleware
router.use(authMiddleware as any);

// GET /api/leads - View All
router.get("/", LeadController.getAll);

// GET /api/leads/:id - View Single Detail
router.get("/:id", LeadController.getById);

// POST /api/leads - Add New Lead
router.post("/", LeadController.create);

// PUT /api/leads/:id - Edit Lead Details
router.put("/:id", LeadController.update);

// DELETE /api/leads/:id - Delete Lead
router.delete("/:id", LeadController.delete);

// POST /api/leads/:id/follow-up - Add Note/Follow Up
router.post("/:id/follow-up", LeadController.addFollowUp);

export default router;
