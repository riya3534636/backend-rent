import express from "express"
import { assignTenant, CreateProperty, deleteProperty, getOwnerProperties, getPropertyById, getPropertyViewDetails, updateProperty } from "../controllers/Property.js"
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js"


const propertyrouter=express.Router()

propertyrouter.post("/create", isAuth,upload.single("image"), CreateProperty)

propertyrouter.get("/getAllProperties",isAuth,getOwnerProperties)

propertyrouter.get("/getBy/:id",isAuth,getPropertyById)

propertyrouter.put("/Update/:id",isAuth,updateProperty)

propertyrouter.delete("/delete/:id",isAuth,deleteProperty)

propertyrouter.post("/AssignTenant/:id",isAuth,assignTenant)

propertyrouter.get("/getPropertyViewDetails/:id",isAuth,getPropertyViewDetails)



export default propertyrouter