import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }
   
  },
  { timestamps: true },
);

export default mongoose.model("Tenant", tenantSchema);
