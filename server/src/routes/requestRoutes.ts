import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  assignRequest,
  cancelRequest,
} from "../controllers/requestController";

const router = Router();

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/

// Create a new service request
router.post("/", requireAuth, createRequest);

// Get requests
// - Admin: All requests
// - User: Only their own requests (handled in controller)
router.get("/", requireAuth, getRequests);

// Get a specific request
// - Admin: Any request
// - User: Only their own request (handled in controller)
router.get("/:id", requireAuth, getRequestById);

// Cancel own request
router.post("/:id/cancel", requireAuth, cancelRequest);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Update request status
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  updateRequestStatus,
);

// Assign request to a support/admin user
router.put("/:id/assign", requireAuth, requireRole("ADMIN"), assignRequest);

export default router;
