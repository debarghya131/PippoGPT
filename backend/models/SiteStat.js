import mongoose from "mongoose";

const SiteStatSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: Number,
    default: 0,
    min: 0,
  },
});

export default mongoose.model("SiteStat", SiteStatSchema);
