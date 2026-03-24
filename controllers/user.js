import User from "../models/user.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/email.js";
import Tenant from "../models/Tenant.js"


const ADMIN_PASSWORD="admin123"

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "please enter all the fields",
      });
    }

    const exsitinguser = await User.findOne({ email });

    if (exsitinguser) {
      return res.status(400).json({
        success: false,
        message: "email already exsist",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "password must be atleast 6 characters",
      });
    }

   

    const role = ADMIN_PASSWORD.includes(password)
      ? "owner"
      : "user";
     

    //  if (role === "owner" && password !== ADMIN_PASSWORD) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "incorrect owner password",
    //   });
    // }

    const hashedpassowrd = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedpassowrd,    
      role,
    });

    const token = await genToken(user._id, user.role);

    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      success: true,
      message: "user created sucessfully",
      user,
      userId:user._id,
      token
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "please enter all the fields",
      });
    }

   

    let  user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "email does not exisit",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "incarrect password",
      });
    }


    const token = await genToken(user._id, user.role);

    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "login sucessfully",
      user,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};


export const logout=async(req,res)=>{
    try {
       res.clearCookie("token");
      return res.status(200).json({success:true,message:"User logged out successfully"});
    } catch (error) {
       return res.status(500).json({message:"Server error", error:error.message});
    }
}

// export const getTenantUsers = async (req, res) => {
//   try {
//     const users = await User.find(
//       { role: "user" },
//       { password: 0 } // hide password
//     );

//    return res.status(200).json({
//       success: true,
//       users
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


export const getTenantUsers = async (req, res) => {
  try {
    // Find all users with role 'user' and exclude password
    const users = await User.find({ role: "user" }, { password: 0 });

    // Filter out users who are already linked to an active tenant with a property
    const availableUsers = [];

    for (const user of users) {
      const tenant = await Tenant.findOne({ user: user._id, property: { $ne: null }, isActive: true });
      if (!tenant) {
        availableUsers.push(user);
      }
    }

    return res.status(200).json({
      success: true,
      users: availableUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = otp;
    user.OtpExpires = expires;
    await user.save();

    await sendOtpMail(email, otp);
    return res.status(200).json({
      success: true,
      message: "otp send sucesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifiyOtp = async (req, res) => {
  const { otp, email } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (!user.resetOtp || !user.OtpExpires) {
      return res.status(400).json({
        success: false,
        message: "otp not genrated or already verfied",
      });
    }

    if (user.OtpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "otp has expired please request new one",
      });
    }
    if (String(otp) !== String(user.resetOtp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    }

    user.isOtpVerified = true;
    user.resetOtp = null;
    user.OtpExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "otp verfied sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal servor error",
    });
  }
};

export const changepassword = async (req, res) => {
  const { email, newpassword, confirmpassword } = req.body;

  if (!newpassword || !confirmpassword) {
    return res.status(400).json({
      success: false,
      message: "all fields are required",
    });
  }

  if (newpassword !== confirmpassword) {
    return res.status(400).json({
      success: false,
      message: "passowrd do not match",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    const hashedpassowrd = await bcrypt.hash(newpassword, 10);
    user.password = hashedpassowrd;
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};





