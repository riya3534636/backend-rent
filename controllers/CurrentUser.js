import User from "../models/user.js";


export const getCurrentUser=async(req,res)=>{
    try {

        const userId=req.userId

        if(!userId){
            return res.status(400).json({
                success:false,message:"userId did not found"
            })
        }

        const user=await User.findById(userId)
        if(!user){
            return res.status(400).json({message:"user is not found"})
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.json(500).json({
            success:false,
            message:"get current user error"
        })
    }
}