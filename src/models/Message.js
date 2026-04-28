import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    parentName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    whatsapp: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true },
    campus: { type: String, trim: true },
    date: { type: String, trim: true },
    time: { type: String, trim: true },
    address: { type: String, trim: true },
    location: { type: String, trim: true },
    extraFields: { type: Object, default: {} },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);

