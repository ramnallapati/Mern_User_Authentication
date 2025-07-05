
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { authRouter } from './Router/authRouter.js';
import { userRouter } from './Router/userRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = ['http://localhost:5173']
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins, // or your frontend URL
  credentials: true
}));

// Connecting DataBase
connectDB();

// Authentication Controllers
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter)

app.get('/', (req, res) => {
  res.send('API Working');
});

app.listen(port, () => {
  console.log(`✅ Server Started on Port : ${port}`);
});
