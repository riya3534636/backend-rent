import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    category: {
      type: String,
      enum: ["plumbing", "electrical", "ac", "general","others"],
      required: true
    },

    description: {
      type: String,
      required: true
    },

    

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);