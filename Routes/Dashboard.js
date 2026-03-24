import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getOwnerDashboardStats } from "../controllers/Dashboard.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats",isAuth,getOwnerDashboardStats)




export default dashboardRouter;