import express from 'express'
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import cors from "cors";
import {clerkMiddleware} from "@clerk/express"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import commentRoutes from "./routes/comment.route.js"
import notificationRoutes from "./routes/notification.route.js"
import { arcjetMiddleware } from './middlewares/arcjet.middleware.js';

const app = express();
app.use(cors());
app.use(express.json())
app.use(clerkMiddleware())
app.use(arcjetMiddleware)

app.use("/api/users",userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/notifications", notificationRoutes)
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