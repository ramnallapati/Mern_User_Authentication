
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


// Conneting the MongoDB DataBase

const connectDB = async ()=> {

    try {


        await mongoose.connect(process.env.MONGO_CLIENT)

        console.log(" ✅ Initial DB connection successfull");

        mongoose.connection.on('connected',()=>{
            
            console.log('🔗 MongoDB Connected');
        });

        mongoose.connection.on('error',(err)=>{
            
            console.error('❌ MongoDB connection error:',err);
        });

        mongoose.connection.on('disconnected',()=>{

            console.warn("⚠️ MongoDB Disconnected");
        });

        mongoose.connection.on('reconnected',()=>{

            console.log('🔄 MongoDB Reconnected');
        })
    } catch (error) {
        console.error(" ❌ Error is Occuring while Connecting Data Base");
        process.exit(1);
    }
    
}

export default connectDB;