// import jwt from "jsonwebtoken"

// const isAuth=async(req,res,next)=>{
//     try {
//        const token=req.cookies?.token
//        if(!token){
//         return res.status(400).json({
//             success:false,
//             message:"token not found"
//         })        
//        } 

//      const decoded= jwt.verify(token,process.env.JWT_SECRET)
//      if(!decoded){
//         return res.status(400).json({
//             success:false,
//             message:"token not verified"
//         })
//      }
//      console.log(decoded)
//      req.userId=decoded.userId
//      next()

//     } catch (error) {
//          return res.status(500).json({
//             success:false,
//             message:"isauth error"
//         })
//     }
// }




// export default isAuth


import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If not found, check cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. If still no token, reject
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not found",
      });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Token not verified",
      });
    }

    // 5. Attach user info to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "isAuth error",
    });
  }
};

export default isAuth;