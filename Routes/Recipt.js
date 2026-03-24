import express from "express";
import { downloadReceiptPDF, getReceipt } from "../controllers/Recipt.js";
import isAuth from "../middleware/isAuth.js"


const reciptRouter=express.Router()

reciptRouter.get("/:id",isAuth,getReceipt)

reciptRouter.get("/:id/pdf",isAuth,downloadReceiptPDF)

export default reciptRouter;