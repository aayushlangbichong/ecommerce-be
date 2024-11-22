import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: true,
  },
  imgurId: {
    type: String,
    required: true,
  },
  imgurDeleteHash: {
    type: String,
    required: true,
  },
  imgurUrl: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

imageSchema.index({ tags: 1 });

export default mongoose.model("Image", imageSchema);
