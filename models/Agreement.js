import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    // 💰 Rent & Charges
    rentAmount: {
      type: Number,
      required: true,
    },


    // 📅 Dates
    dueDate: {
      type: Number, // 1–31 (day of month)
      required: true,
      min: 1,
      max: 31,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    electricityCharge:{
      type:Number,
      required:true
    },
     waterCharge:{
      type:Number,
      required:true
     },

    // 📄 Agreement file (multer upload)
    // agreementFile: {
    //   type: String, // file path or URL
    // },

    image: { type: String, default: null },

    // 📌 Status
    status: {
      type: String,
      enum: ["active", "expired", "terminated"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Agreement", agreementSchema);