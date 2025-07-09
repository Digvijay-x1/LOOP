import asyncHandler from "express-async-handler"
import User from "../models/user.model.js"
import {getAuth} from "@clerk/express"
import Notification from "../models/notification.model.js"
import { clerkClient } from "@clerk/express"

export const getUserProfile = asyncHandler(async (req, res) => {
    const {username} = req.params;
    const user = await User.findOne({username});

    if(!user) return res.status(404).json({error: "User not found" });

    res.status(200).json({user})

});

export const updateProfile = asyncHandler(async (req, res) => {
    const {userId} = getAuth(req);
    const user = await User.findOneAndUpdate({clerkId: userId}, req.body, {new: true});
    if(!user) return res.status(404).json({error: "User not found"});

    res.status(200).json({user})
});

export const syncUser = asyncHandler(async (req,res) =>{
    const {userId} = getAuth(req);
    const existingUser = await User.findOne({clerkId: userId});
    if(existingUser) return res.status(200).json({user: existingUser , message: "User already exists"});

    // create new user from clerk data 
    const clerkUser = await clerkClient.users.getUser(userId);

    const userData = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        username: clerkUser.emailAddresses[0].emailAddress.split("@")[0] + "_" + Math.random().toString(36).substring(2, 9),
        profilePicture: clerkUser.imageUrl || "",
    }

    const newUser = await User.create(userData);

    res
    .status(201)
    .json({user: newUser, message: "User created successfully"})
})

export const getCurrentUser = asyncHandler(async (req,res) =>{
     const {userId} = getAuth(req);
     const user = await User.findOne({clerkId: userId});

     if(!user) return res.status(404).json({error: "User not found"});

     res.status(200).json({user})
})

export const followUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { userId: targetUserId } = req.params;
  
    if (userId === targetUserId) return res.status(400).json({ error: "You cannot follow yourself" });
  
    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById(targetUserId);
  
    if (!currentUser || !targetUser) return res.status(404).json({ error: "User not found" });
  
    const isFollowing = currentUser.following.includes(targetUserId);
  
    if (isFollowing) {
      // unfollow
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUser._id },
      });
    } else {
      // follow
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: targetUserId },
      });
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUser._id },
      });
  
      // create notification
      await Notification.create({
        from: currentUser._id,
        to: targetUserId,
        type: "follow",
      });
    }
  
    res.status(200).json({
      message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
    });
  });


export const getFollowers = asyncHandler(async (req, res) => {
    const {userId} = getAuth(req);
    const currentUser = await User.findOne({clerkId: userId});

    if(!currentUser) return res.status(404).json({error: "User not found"});
    
    
    const followers = await User.find({following: currentUser._id});
    res.status(200).json({followers: followers.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        profilePicture: user.profilePicture,
        isFollowing: currentUser.following.includes(user._id),
        username: user.username,
    }))})
})


export const getFollowing = asyncHandler(async (req, res) => {
    const {userId} = getAuth(req);
    const currentUser = await User.findOne({clerkId: userId});

    if(!currentUser) return res.status(404).json({error: "User not found"});

    // users whom currentUser is following
    const following = await User.find({followers: currentUser._id});
    res.status(200).json({following: following.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        profilePicture: user.profilePicture,
        isFollowing: currentUser.following.includes(user._id),
        username: user.username,
    }))})
})


export const searchUsers = asyncHandler(async (req, res) => {
    const {query} = req.params;

    const users = await User.find({$or: [{firstName: {$regex: query, $options: "i"}}, {lastName: {$regex: query, $options: "i"}}, {username: {$regex: query, $options: "i"}}]});
    res.status(200).json({users: users.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        profilePicture: user.profilePicture,
        username: user.username,
    }))})

    console.log(users);
})


export const getUserProfileById = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    const user = await User.findById(userId);

    if(!user) return res.status(404).json({error: "User not found"});

    res.status(200).json({user})
})

