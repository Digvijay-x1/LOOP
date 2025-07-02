import mongoose from 'mongoose';
import { ENV } from './env.js';


export const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log('Connected to MongoDB ✅');
    } catch (error) {
        console.log("Error connecting to MongoDB", error.message);
        process.exit(1);
    }
}