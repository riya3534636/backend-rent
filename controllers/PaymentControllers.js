import Razorpay from "razorpay";
import Bill from "../models/Bill.js";
import dotenv from "dotenv";
import crypto from "crypto"

dotenv.config();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  
});

/**
 * CREATE PAYMENT ORDER
 * POST /api/payments/create-order/:billId
 */
export const createOrder = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.status.toLowerCase() === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }

    const order = await razorpay.orders.create({
      amount: bill.totalAmount * 100, // use totalAmount
      currency: "INR",
      receipt: `bill_${bill._id}`,
    });

    bill.razorpayOrderId = order.id;
    await bill.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      billId: bill._id,
    });
  } catch (error) {
    console.error("Payment order creation failed:", error.message, error);
    res.status(500).json({ message: "Payment order creation failed" });
  }
};



// Verify Payment Controller
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    bill.status = "Paid"; // ✅ matches schema
    bill.razorpayPaymentId = razorpay_payment_id;
    bill.paidAt = new Date();
    bill.paymentMethod = "Razorpay";

    await bill.save();

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
