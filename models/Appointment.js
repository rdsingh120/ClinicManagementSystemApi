import mongoose from "mongoose";

// simple code like AB12-CD34 
const genCode = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() + "-" +
  Math.random().toString(36).slice(2, 6).toUpperCase();

const AppointmentSchema = new mongoose.Schema(
  {
    // separate token in addition to Mongo's _id
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      unique: true,
      index: true,
    },

    patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, required: true },

    date:      { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },

    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Completed", "Cancelled"],
      default: "Scheduled",
      index: true,
    },

    notes: { type: String },
    confirmationCode: { type: String, default: genCode, index: true },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

// basic check
AppointmentSchema.path("endTime").validate(function (v) {
  return this.startTime && v > this.startTime;
}, "endTime must be after startTime");

// prevent double-booking for active appts
AppointmentSchema.index(
  { doctorId: 1, startTime: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["Scheduled", "Confirmed"] } } }
);

export default mongoose.model("Appointment", AppointmentSchema);
