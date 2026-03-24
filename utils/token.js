import jwt from "jsonwebtoken"

const Gentoken=async(userId,Role)=>{
     try {

     const token=await jwt.sign({userId,Role},process.env.JWT_SECRET,{expiresIn:"7d"})

     return token

        
     } catch (error) {

        console.log(error)
        
     }
}

export default Gentoken
