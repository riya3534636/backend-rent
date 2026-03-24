import express from "express";
import { changepassword, forgetpassword, getTenantUsers, login, logout, register, verifiyOtp } from "../controllers/user.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgetpassword);
authRouter.post("/verify-otp", verifiyOtp);
authRouter.post("/change-password", changepassword);
authRouter.get("/tenant-users",getTenantUsers)




export default authRouter;