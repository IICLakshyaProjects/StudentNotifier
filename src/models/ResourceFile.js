import mongoose from "mongoose";

const ResourceFileSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceCategory",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    s3Key: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.ResourceFile ||
  mongoose.model("ResourceFile", ResourceFileSchema);
