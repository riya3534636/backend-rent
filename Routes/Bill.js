import express from "express"
import isAuth from "../middleware/isAuth.js";
import { createBill, getBillById, getBillsByProperty, getBillsByTenant, getOwnerBills, getTenantBills, manualGenerateBills, payBill, updateBill } from "../controllers/Bill.js";
import Bill from "../models/Bill.js";

const Billrouter=express.Router()

Billrouter.post("/createBill",isAuth,createBill)

Billrouter.get("/getTenatBill",isAuth,getTenantBills)

Billrouter.get("/getBillsByTenant/:id",isAuth,getBillsByTenant)

Billrouter.get("/getOwnerBills",isAuth,getOwnerBills)

Billrouter.get("/getBillById/:id",getBillById)

Billrouter.get("/getBillsByProperty/:id ",isAuth,getBillsByProperty)

Billrouter.put("/update/:id",updateBill)


Billrouter.post("/payBill/:billId",isAuth,payBill)


export default Billrouter