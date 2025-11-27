// controllers/testimonial.controller.js
import Testimonial from "../models/Testimonial.js";
import mongoose from "mongoose";

const isOid = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/testimonials/my 
export const getMyTestimonialsAsDoctor = async (req, res) => {
  try {
    const doctorId = req.user?.id || req.user?._id;

    if (!doctorId || !isOid(doctorId)) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const testimonials = await Testimonial.find({
      doctorId,
      isVisible: true,
    })
      .populate("patientId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (err) {
    console.error("getMyTestimonialsAsDoctor error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
