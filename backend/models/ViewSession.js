import mongoose from "mongoose";

const ViewSessionSchema = new mongoose.Schema({
  counterKey: {
    type: String,
    required: true,
    trim: true,
  },
  sessionHash: {
    type: String,
    required: true,
    trim: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

ViewSessionSchema.index({ counterKey: 1, sessionHash: 1 }, { unique: true });

export default mongoose.model("ViewSession", ViewSessionSchema);
