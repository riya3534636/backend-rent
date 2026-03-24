import express from "express"
import isAuth from "../middleware/isAuth.js"
import {  assignTenantToUser, createTenant, deleteTenant, getCurrentMonthBill, getCurrentTenantToUser, getMaintenanceSummary, getOwnerTenants, getTenantDashboardSummary, getTenantProfile, getTenantViewDetails, getVacantActiveTenants, vacateTenant } from "../controllers/Tenant.js"


const tenantrouter=express.Router()

tenantrouter.post("/addTenant",isAuth,createTenant)

tenantrouter.get("/getByOwnerTenat",isAuth,getOwnerTenants)

tenantrouter.get("/getActiveTentant" ,isAuth,getVacantActiveTenants)

tenantrouter.post("/assign-tenant",assignTenantToUser)

tenantrouter.get("/getMyProfile",isAuth,getCurrentTenantToUser)

tenantrouter.get("/getTenantViewDetails/:id",isAuth,getTenantViewDetails)

tenantrouter.delete("/RemoveVacateTenant/:id",isAuth,vacateTenant)


tenantrouter.get("/tenantDashboard/summary",isAuth,getTenantDashboardSummary)

tenantrouter.get("/getCurrentMonthBill",isAuth,getCurrentMonthBill)

tenantrouter.get("/getMaintenanceSummary",isAuth,getMaintenanceSummary)


tenantrouter.delete("/DeleteTenant/:id",isAuth,deleteTenant)


export default tenantrouter
