import express from "express";
import { getCurrentUser } from "../controllers/CurrentUser.js";
import isAuth from "../middleware/isAuth.js";

const currentRouter = express.Router();

currentRouter.get("/current-user",isAuth,getCurrentUser)




export default currentRouter;