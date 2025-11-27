import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      required: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

TestimonialSchema.index({ doctorId: 1, createdAt: -1 });

export default mongoose.model("Testimonial", TestimonialSchema);
