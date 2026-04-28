import mongoose from "mongoose";

const CampusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    nextSequence: { type: Number, default: 1 },
  },
  { timestamps: true }
);

CampusSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Campus || mongoose.model("Campus", CampusSchema);

