import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    // owner is a lightweight per-user identifier (stored client-side). Not required
    // so existing tasks without owner won't break migrations.
    owner: { type: String },
  // deletedFor holds owner ids for whom this task has been 'deleted' (hidden)
  deletedFor: { type: [String], default: [] },
  },
  { timestamps: true }
);


export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
