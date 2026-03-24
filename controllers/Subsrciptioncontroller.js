import Bill from "../models/Bill.js"

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createSubscription = async (req, res) => {
  try {
    const { billId } = req.body;

    const subscription = await razorpay.subscriptions.create({
      plan_id: "plan_SUM8rtk9pXB5KV", // replace with real plan ID
      customer_notify: 1,
      total_count: 12,
      notes: { billId }, // attach billId for mapping
    });

    await Bill.findByIdAndUpdate(billId, {
      subscriptionId: subscription.id,
    });

    res.json(subscription);
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// webhookController.js

export const webhook = async (req, res) => {
  console.log("🔥 WEBHOOK HIT");
  console.log("BODY:", JSON.stringify(req.body, null, 2));

  const event = req.body.event;

  try {
    if (event === "subscription.charged") {
      const subscription = req.body.payload.subscription.entity;
      const payment = req.body.payload.payment.entity;
      const billId = subscription.notes?.billId;

      if (!billId) {
        console.log("❌ No billId in subscription notes");
        return res.status(200).json({ success: true });
      }

      await Bill.findByIdAndUpdate(billId, {
        status: "Paid",
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id,
        transactionId: payment.id,
        transactionDate: new Date(payment.created_at * 1000),
        paymentMethod: payment.method || "Razorpay",
        paidAt: new Date(payment.created_at * 1000),
      });

      console.log("✅ BILL UPDATED SUCCESSFULLY:", billId);
    }

    if (event === "invoice.paid") {
      const invoice = req.body.payload.invoice.entity;
      const payment = req.body.payload.payment.entity;
      const subscriptionId = invoice.subscription_id;

      const bill = await Bill.findOne({ subscriptionId });
      if (!bill) {
        console.log("❌ No bill found for subscription:", subscriptionId);
        return res.status(200).json({ success: true });
      }

      await Bill.findByIdAndUpdate(bill._id, {
        status: "Paid",
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id,
        transactionId: payment.id,
        transactionDate: new Date(payment.created_at * 1000),
        paymentMethod: payment.method || "Razorpay",
        paidAt: new Date(payment.created_at * 1000),
      });

      console.log("✅ BILL UPDATED SUCCESSFULLY:", bill._id);
    }

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      const bill = await Bill.findOne({ razorpayOrderId: payment.order_id });

      if (!bill) {
        console.log("❌ No bill found for order:", payment.order_id);
        return res.status(200).json({ success: true });
      }

      await Bill.findByIdAndUpdate(bill._id, {
        status: "Paid",
        razorpayPaymentId: payment.id,
        transactionId: payment.id,
        transactionDate: new Date(payment.created_at * 1000),
        paymentMethod: payment.method || "Razorpay",
        paidAt: new Date(payment.created_at * 1000),
      });

      console.log("✅ BILL UPDATED SUCCESSFULLY:", bill._id);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
