import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./Routes/user.js";
import currentRouter from "./Routes/CurrentUser.js";
import cors from "cors";
import propertyrouter from "./Routes/Property.js";
import Agrementrouter from "./Routes/Agrreement.js";
import Billrouter from "./Routes/Bill.js";
import Maintenancerouter from "./Routes/Maintenance.js";
import tenantrouter from "./Routes/Tenant.js";
import { startAutoBillCron } from "./cron/autoBillCron.js";
import paymentRouter from "./Routes/Payment.js";
import reciptRouter from "./Routes/Recipt.js";
import dashboardRouter from "./Routes/Dashboard.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/user", authRouter);
app.use("/api/tenant",tenantrouter)
app.use("/api/auth", currentRouter);
app.use("/api/property",propertyrouter)
app.use("/api/agreement",Agrementrouter)
app.use("/api/bill",Billrouter)
app.use("/api/maintenace",Maintenancerouter)
app.use("/api/payment",paymentRouter)
app.use("/api/recipt",reciptRouter)
app.use("/api/dashboard",dashboardRouter)



startAutoBillCron();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});