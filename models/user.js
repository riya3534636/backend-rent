import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['user','owner'],
        default:'user',
        required:true,
    },
     resetOtp: {
      type: Number,
      default: null,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    OtpExpires: {
      type: Date,
      default: null,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    tenant:{
       type:mongoose.Schema.Types.ObjectId,
        ref:"Tenant",
        default:null 
    },

},{timestamps:true})


const user=mongoose.model('User',userSchema);

export default user;