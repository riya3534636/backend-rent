import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    // 🔗 Owner
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏠 Basic Property Info
    propertyName: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: ["Apartment", "Independent House", "Villa", "PG", "Commercial"],
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    // 🛏 Details
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },

    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },

    areaSqft:{
      type:Number,
      required:true
    },

    // 🔌 Utilities
    hasParking: {
      type: Boolean,
      default: false,
    },

    hasWaterConnection: {
      type: Boolean,
      default: true,
    },

    hasElectricityConnection: {
      type: Boolean,
      default: true,
    },  

    // 📌 Status
    Status: {
      type: String,
      enum:["vacant","occupied"],
      default: "vacant",
    },
    tenant:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Tenant",
      default:null
    },

    rent:{
      type:Number,
      required:true
    },

     image: { type: String, default: null },
     
     leaseStartDate:{
      type:Date,
      default:null
     },


    currentAgreementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agreement",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);