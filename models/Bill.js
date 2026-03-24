import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    // 🔗 Relations
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    // 📅 Billing period
    month: {
      type: String, // e.g. "January"
      required: true,
    },

    year: {
      type: Number, // e.g. 2025
      required: true,
    },

    // 💰 Amount details
    rentAmount: {
      type: Number,
      required: true,
    },

    waterAmount: {
      type: Number,
      default: 0,
    },

    unitsUsed: {
      type: Number,
      default: 0,
    },

    electricityAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // ⏰ Due & status
    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue"],
      default: "Pending",
    },

    // ⏳ Pending & penalty
    pendingPeriod: {
      type: Number, // days overdue
      default: 0,
    },

    overdueFee: {
      type: Number,
      default: 0,
    },

    // 💳 Payment info
    isDefaultPaid: {
      type: Boolean, // auto-pay success
      default: false,
    },

    paidAt: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "UPI", "Card", "NetBanking", "Cash"],
    },

  

    autoPayAttempts: {
      type: Number,
      default: 0,
    },

    paidAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "UPI", "Card", "NetBanking", "Cash"],
    },

    subscriptionId: { type: String },

    // 🔥 Razorpay transaction details
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // ✅ New fields for receipt
    transactionId: { type: String },      // Razorpay payment ID
    transactionDate: { type: Date },      // when payment was captured
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "UPI", "Card", "NetBanking", "Cash"],
    },
  },
  {
    timestamps: true,
  },
);

// 🔒 Prevent duplicate bill for same month/year/property
billSchema.index({ property: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Bill", billSchema);
