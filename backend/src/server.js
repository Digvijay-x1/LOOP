import express from 'express'
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import cors from "cors";
import {clerkMiddleware} from "@clerk/express"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"

const app = express();
app.use(cors());
app.use(express.json())
app.use(clerkMiddleware())

app.use("/api/users",userRoutes)
app.use("/api/posts", postRoutes)
app.get('/', (req, res) => {
    res.send('Hello From LOOP server');
});

// error handling middleware
app.use((err, req, res , next) => {
    console.error("Error in server", err);
    res.status(500).json({ error: "Something went wrong" });
  });
app.listen(ENV.PORT,  () => {
    console.log(`Server is running on port ${ENV.PORT}`);
    connectDB();
});