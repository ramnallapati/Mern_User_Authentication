
import mongoose,{Schema} from "mongoose";

const userSchema = new Schema(

    {
        name :
        {
            type:String,
            required:[true,"UserName Must be Entered"],
        },
        email :
        {
            type:String,
            required:[true,"Email Must be Entered"],
            unique:true,
        },
        password:
        {
            type:String,
            required:[true,'Password must be Entered'],
        },
        verifyOtp:
        {
            type:Date,
            default:'',
        },
        verifyOptExpireAt:
        {
            type:Date,
            default:0,
        },
        isAccountVerified:
        {
            type:Boolean,
            default:false
        },
        resetOtp:
        {
            type:String,
            default:'',
        },
        resetOtpExpireAt:
        {
            type:Number,
            default:0
        }
    }
)
export const User = mongoose.model('User',userSchema);