// routes/testimonialRoutes.js
import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { getMyTestimonialsAsDoctor } from "../controllers/testimonial.controller.js";

const router = express.Router();

// /api/testimonials/my
router.get("/my", auth, getMyTestimonialsAsDoctor);

export default router;
