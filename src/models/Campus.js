import mongoose from "mongoose";

import { CAMPUS_SEQUENCE_START } from "@/lib/campus-sequence";

const CampusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    nextSequence: { type: Number, default: CAMPUS_SEQUENCE_START },
  },
  { timestamps: true }
);

CampusSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Campus || mongoose.model("Campus", CampusSchema);
