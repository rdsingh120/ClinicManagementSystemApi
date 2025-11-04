import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";

export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      status,              // optional; defaults in schema
      notes,               // optional
      confirmationCode,    // optional; auto-gen in schema
      cancellationReason,  // optional
    } = req.body;

    // presence checks
    if (!patientId || !doctorId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "patientId, doctorId, startTime, and endTime are required",
      });
    }

    // Ensure valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patientId or doctorId",
      });
    }

    // Convert times
    const start = new Date(startTime);
    const end   = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid startTime or endTime" });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: "endTime must be after startTime" });
    }

    // Optionally enforce same-day rule: if 'date' not provided, derive from startTime
    let apptDate = date ? new Date(date) : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    if (isNaN(apptDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }

    // Create doc
    const appt = await Appointment.create({
      patientId,
      doctorId,
      date: apptDate,
      startTime: start,
      endTime: end,
      status,
      notes,
      confirmationCode,
      cancellationReason,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment created",
      appointment: appt,
    });
  } catch (e) {
    // Handle duplicate key (e.g., unique index preventing double-booking)
    if (e.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Time slot already booked for this doctor",
        details: e.keyValue,
      });
    }

    // Mongoose validation errors
    if (e.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.fromEntries(
          Object.entries(e.errors).map(([k, v]) => [k, v.message])
        ),
      });
    }

    console.error("Create appointment error:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const listAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, status, from, to, page = 1, limit = 20, sort } = req.query;

    const q = {};

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ success: false, message: "Invalid doctorId" });
      }
      q.doctorId = doctorId;
    }

    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ success: false, message: "Invalid patientId" });
      }
      q.patientId = patientId;
    }

    if (status) q.status = status;

    if (from || to) {
      q.startTime = {};
      if (from) {
        const f = new Date(from);
        if (isNaN(f.getTime())) return res.status(400).json({ success: false, message: "Invalid 'from' date" });
        q.startTime.$gte = f;
      }
      if (to) {
        const t = new Date(to);
        if (isNaN(t.getTime())) return res.status(400).json({ success: false, message: "Invalid 'to' date" });
        q.startTime.$lte = t;
      }
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const sortSpec = sort ? sort : "startTime";

    const [items, total] = await Promise.all([
      Appointment.find(q).sort(sortSpec).skip(skip).limit(limitNum),
      Appointment.countDocuments(q),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      items,
    });
  } catch (e) {
    console.error("List appointments error:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });

    return res.status(200).json({ success: true, appointment: appt });
  } catch (e) {
    console.error("Get appointment error:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.body?.reason || "Cancelled by requester";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });

    // business rules (tune as you like)
    if (appt.status === "Completed") {
      return res.status(409).json({ success: false, message: "Completed appointments cannot be cancelled" });
    }

    if (appt.status === "Cancelled") {
      // idempotent behaviour: return current state
      return res.status(200).json({
        success: true,
        message: "Appointment already cancelled",
        appointment: appt,
      });
    }

    appt.status = "Cancelled";
    appt.cancellationReason = reason;
    await appt.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled",
      appointment: appt,
    });
  } catch (e) {
    console.error("Cancel appointment error:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
