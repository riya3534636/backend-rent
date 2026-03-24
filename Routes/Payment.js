import express from "express";
import { createOrder, verifyPayment } from "../controllers/PaymentControllers.js";
import {  createSubscription, webhook } from "../controllers/Subsrciptioncontroller.js";

const paymentRouter=express.Router()

paymentRouter.post("/create-order/:billId",createOrder)

paymentRouter.post("/verifiy",verifyPayment)

paymentRouter.post("/create-subscription",createSubscription)

paymentRouter.post("/webhook",express.raw({ type: "application/json" }), webhook
);

export default paymentRouter;