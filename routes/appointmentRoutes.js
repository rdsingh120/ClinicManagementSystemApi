import express from "express";
import {
  createAppointment,
  listAppointments,
  getAppointmentById,
  cancelAppointment,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.post("/", createAppointment);      // CREATE
router.get("/", listAppointments);        // READ (list)
router.get("/:id", getAppointmentById);   // READ (single)
router.delete("/:id", cancelAppointment);   // cancel
export default router;





