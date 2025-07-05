
import express from 'express';
import { isAuthenticated, resetOtp, sendVerifyOtp, userLogin, userLogout, userRegister, verifyEmail, verifyResetOtp } from '../Controller/authController.js';
import { userAuth } from '../Middlewears/userAuth.js';

export const authRouter = express.Router();

authRouter.post('/register',userRegister);
authRouter.post('/login',userLogin);
authRouter.post('/logout',userLogout);
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp);
authRouter.post('/verify-account',userAuth,verifyEmail);
authRouter.get('/is-auth',userAuth,isAuthenticated);
authRouter.post('/reset-otp',resetOtp)
authRouter.post('/verify-reset-otp',verifyResetOtp);


