import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ServiceRequest } from "../models/ServiceRequest";
import mongoose from "mongoose";

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: "Title and description are required",
      });
    }

    const newRequest = new ServiceRequest({
      title,
      description,
      category: category || "Other",
      priority: priority || "MEDIUM",
      status: "OPEN",
      createdBy: req.user?.id,
      statusHistory: [
        {
          status: "OPEN",
          changedBy: new mongoose.Types.ObjectId(req.user?.id),
          note: "Request created",
          changedAt: new Date(),
        },
      ],
    });

    const savedRequest = await newRequest.save();

    return res.status(201).json(savedRequest);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create request",
      details: (error as Error).message,
    });
  }
};

export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.user?.role === "ADMIN" ? {} : { createdBy: req.user?.id };

    const requests = await ServiceRequest.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch requests",
    });
  }
};

export const getRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const request = await ServiceRequest.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("statusHistory.changedBy", "name email");

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    // Authorization
    if (req.user?.role !== "ADMIN") {
      const createdBy = request.createdBy as mongoose.Types.ObjectId & {
        _id?: mongoose.Types.ObjectId;
      };

      const createdById = createdBy._id
        ? createdBy._id.toString()
        : createdBy.toString();

      if (createdById !== req.user?.id) {
        return res.status(403).json({
          error: "Access denied",
        });
      }
    }

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({
      error: "Error fetching request details",
      details: (error as Error).message,
    });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await ServiceRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    request.status = status;

    request.statusHistory.push({
      status,
      changedBy: new mongoose.Types.ObjectId(req.user?.id),
      note: `Status changed to ${status}`,
      changedAt: new Date(),
    });

    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update status",
      details: (error as Error).message,
    });
  }
};

export const assignRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const request = await ServiceRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    // Assign or Unassign
    if (assignedTo && assignedTo.trim() !== "") {
      request.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    } else {
      request.assignedTo = null;
    }

    request.statusHistory.push({
      status: request.status,
      changedBy: new mongoose.Types.ObjectId(req.user!.id),
      note: assignedTo ? "Request assigned" : "Request unassigned",
      changedAt: new Date(),
    });

    await request.save();

    const updatedRequest = await ServiceRequest.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("statusHistory.changedBy", "name email");

    return res.status(200).json({
      message: assignedTo
        ? "Request assigned successfully."
        : "Request unassigned successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to assign request",
      details: (error as Error).message,
    });
  }
};

export const cancelRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const request = await ServiceRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    if (
      req.user?.role !== "ADMIN" &&
      request.createdBy.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    if (request.status === "RESOLVED" || request.status === "CANCELLED") {
      return res.status(400).json({
        error: "This request cannot be cancelled.",
      });
    }

    request.status = "CANCELLED";

    request.statusHistory.push({
      status: "CANCELLED",
      changedBy: new mongoose.Types.ObjectId(req.user?.id),
      note: "Cancelled by user",
      changedAt: new Date(),
    });

    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to cancel request",
      details: (error as Error).message,
    });
  }
};
