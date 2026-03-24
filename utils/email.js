import nodemailer from "nodemailer"
import  dotenv from "dotenv"

dotenv.config()


export const sendOtpMail=async(email,otp)=>{
     const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASS
        }
     })

     const mailOptions={
        from:process.env.EMAIL,
        to:email,
        subject:'otp verification',
        html:`<p>your otp for passowrd reset id=s: <b>${otp}</b>.It is vaild for 10 minutes</p>`
     }

     await transporter.sendMail(mailOptions)
}
