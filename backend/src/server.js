import express from 'express'
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import cors from "cors";
import {clerkMiddleware} from "@clerk/express"
import userRoutes from "./routes/user.route.js"

const app = express();
app.use(cors());
app.use(express.json())
app.use(clerkMiddleware())

app.use("/api/users",userRoutes)
app.get('/', (req, res) => {
    res.send('Hello From LOOP server');
});

app.listen(ENV.PORT,  () => {
    console.log(`Server is running on port ${ENV.PORT}`);
    connectDB();
});