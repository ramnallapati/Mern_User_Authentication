
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { transporter } from '../config/nodemailer.js';


export const userRegister = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "❌ Some required details are missing" });
    }

    try {
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(409).json({ success: false, message: "✅ User already exists in database" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        // Optionally, remove password from the response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        // CreateTokens
        const token = jwt.sign(
            {id:user._id},
            process.env.ACCESS_SECRET,
            {
                expiresIn:'7d'
            }
        );

        res.cookie('token',token,{
            
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from : process.env.USER_EMAIL,
            to:email,
            subject:"Create an Account on BackBench Coders",
            text:`You are Created an account Successfully with email : ${email}`
        }

        // sending a mail
        transporter.sendMail(mailOptions);

        console.log("✅ User registration created successfully!");
        res.status(201).json({ success: true, message: "User registered successfully", user: userResponse,cookie:token });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


export const userLogin = async (req,res)=> {

    const {email,password} = req.body;

    if(!email || !password) {

        return res.status(400).json({success:false,message:"❌ Required Details are Missing!"});
    }

    try {

        const userExist = await User.findOne({email});

        if(!userExist) {

            return res.status(401).json({success:false,message:"❌ Email is InValid"});
        }

        const passwordMatch = await bcrypt.compare(password,userExist.password);

        if(!passwordMatch) {

            return res.status(401).json({success:false,message:"❌ Password Does not Match. Please Check once again"});
        }

        const token = jwt.sign(
            {
                id:userExist._id,
            },
            process.env.ACCESS_SECRET,
            {
                expiresIn:'7d',
            }
        );

        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
           
            maxAge:7*24*60*60*1000
        });

        const userResponse = {
            id:userExist._id,
            email : userExist.email,
        };

        console.log("✅ User Login Successfully !");
        res.status(200).json({success:true,message:"✅ User Login Successfully",user:userResponse});
    } catch(error) {

        console.log({success:false,message:error.message});
    }
}


export const userLogout = async (req,res)=> {

    try {
        
        res.clearCookie('token',{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        });

        res.status(302).json({success:true,message:"✅ userLogout Successfully!"});

    } catch (error) {

        res.status(401).json({success:false,message:error.message});
    }
}


// Send verification Otp to the user's email

export const sendVerifyOtp = async (req,res)=>{

    try {

        const {userId} = req.body;

        const user = await User.findById(userId);

        if(user.isAccountVerified) {

            return res.status(200).json({success:false,message:"Account is already Verified"});
        }

        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.verifyOtp = otp;
        user.verifyOptExpireAt = Date.now() + 24*60*60*1000;
        
        await user.save();


        const mailOptions = {
            from : process.env.USER_EMAIL,
            to :  user.email,
            subject : "Account Verification OTP",
            text : `your OTP is ${otp}. Verify your account using this OTP.`
        }
        transporter.sendMail(mailOptions);

        console.log(`Verification OTP is sent successfully to the email : ${user.email}`);
        res.status(200).json({success:true,message:"verification OTP",verificationOTP : otp,email:user.email});
    } catch(error) {

        res.status(404).json({success:false,message:error.message});
    }
}



export const verifyEmail = async (req,res)=> {

    const {userId,otp} = req.body;

    if(!userId || !otp) {
        
        return res.status(400).json({success:false,message:"Missing Details"});
    }

    try {

        const user = await User.findById(userId);

        if(!user) {
            
            return res.status(400).json({success:false,message:`User Not Found`});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            
            return res.status(400).json({success:false,message:'Invalid Otp '});
        }

        if(user.verifyOptExpireAt < Date.now()) {

            return res.status(200).json({success:false,message:"OTP is Expired"});
        }

        user.isAccountVerified = true,
        user.verifyOtp = '',
        user.verifyOptExpireAt = 0;

        await user.save();

        res.status(200).json({success:true,message:'Email Verified Successfully'});
    } catch(error) {

        res.status(200).json({success:false,message:error.message});
    }
}



// Authentication 

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}


// send password reset Otp

export const resetOtp = async (req,res) => {

    const {email} = req.body;

    if(!email) {

        return res.json({success:false,message:"Enter a Email"});
    }

    try {

        const user = await User.findOne({email});

        if(!user) {
            
            return res.json({success:false,message:"User is not Existing in the Data Base"});
        }

        const otp = String(Math.floor(100000+Math.random()*900000));

        const emailOption = {
            from : process.env.USER_EMAIL,
            to : email,
            subject : "Password Reset Email",
            text : `To Change the Password using this OTP : ${otp}`
        }

        await transporter.sendMail(emailOption);

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60*1000;
        
        await user.save();

        console.log('Resetting Otp is send Succcessfully !');
        res.json({success:true,message:'OTP is Sending an Email Successfully !'});

    } catch (error) {

        return res.json({success:false,message:error.message});
    }
}


export const verifyResetOtp = async (req,res)=> {

    const {email,otp,newPassword} = req.body;

    if(!otp || !newPassword || !email) {

        return res.json({success:false,message:"Missing Required Details. Please Enter"});
    }

    try {

        const user = await User.findOne({email});

        if(!user) {

            return res.json({success:false,message:"User not Existing in the DataBase"});
        }

        if(otp === '' || user.resetOtp !== otp) {

            return res.json({success:false,message:"OTP is Invalid. Please Check once Email!"});
        }

        if(user.resetOtpExpireAt < Date.now()) {
            
            return res.json({success:false,message:"OTP is Expiring. Resend OTP"});
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        console.log(`Password is Reset Successfully!`);

        res.json({success:true,message:'Password is Reset Successfully!'});

    } catch (error) {

        res.json({success:false,message:error.message});
    }
}
