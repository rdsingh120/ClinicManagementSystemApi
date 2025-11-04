// routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  listAppointments,
  getAppointmentById,
  updateAppointment,
  confirmAppointment,
  cancelAppointment,
  deleteAppointment
} from "../controllers/appointmentController.js";

// Optional middleware imports (add later if you have auth)
// import { auth } from "../middlewares/auth.js";
// import { isDoctorOrAdmin, isAdmin } from "../middlewares/rbac.js";

const router = express.Router();

router.post("/", createAppointment);
router.get("/", listAppointments);
router.get("/:id", getAppointmentById);
router.put("/:id", updateAppointment);
router.post("/:id/confirm", confirmAppointment);
router.post("/:id/cancel", cancelAppointment);
router.delete("/:id", deleteAppointment);

export default router;
