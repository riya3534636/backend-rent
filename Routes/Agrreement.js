import express from "express"
import { createAgreement, deleteAgreement, endAgreement, getAgreementById, getOwnerAgreements, getTenantAgreement } from "../controllers/Aggreement.js"
import { upload } from "../middleware/multer.js"
import isAuth from "../middleware/isAuth.js"

const Agrementrouter=express.Router()

Agrementrouter.post("/create",isAuth, upload.single("image") , createAgreement)

Agrementrouter.get("/getAggrementByTenant",isAuth,getTenantAgreement)

Agrementrouter.get("/getAllAggrements",isAuth,getOwnerAgreements)

Agrementrouter.get("/get/:id",isAuth,getAgreementById)

Agrementrouter.delete("/endAggrement/:id",isAuth,endAgreement)

Agrementrouter.delete("/delete/:selectedAgreementId",isAuth,deleteAgreement)

export default Agrementrouter