import express from "express"
import isAuth from "../middleware/isAuth.js";
import { createIssue,  getMyMaintenance, getOwnerIssues, getSingleMaintenance, updateIssueStatus } from "../controllers/Maintenance.js";

const Maintenancerouter=express.Router()

Maintenancerouter.post("/createIssue",isAuth,createIssue)

Maintenancerouter.get("/getMyIssue",isAuth,getMyMaintenance)

Maintenancerouter.get("/getByOwner",isAuth,getOwnerIssues)

Maintenancerouter.put("/updateStatus/:id",isAuth,updateIssueStatus)

Maintenancerouter.get("/getDetailsMaintenance/:id",isAuth,getSingleMaintenance)


export default Maintenancerouter