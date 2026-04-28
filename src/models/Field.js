import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    type: {
      type: String,
      enum: ["text", "email", "tel", "url", "password", "number", "date", "time"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FieldSchema.index({ key: 1 }, { unique: true });

export default mongoose.models.Field || mongoose.model("Field", FieldSchema);

