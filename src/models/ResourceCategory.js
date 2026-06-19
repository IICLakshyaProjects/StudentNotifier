import mongoose from "mongoose";

const ResourceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.ResourceCategory ||
  mongoose.model("ResourceCategory", ResourceCategorySchema);
