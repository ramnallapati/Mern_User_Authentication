
import express from 'express';
import { userAuth } from '../Middlewears/userAuth.js';
import { getuserData } from '../Controller/userController.js';

export const userRouter = express.Router();

userRouter.get('/data',userAuth,getuserData);
