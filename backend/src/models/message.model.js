import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        maxlength: 5000, // Increased max length for messages
    },
    image: {
        type: String
    },
},
{ timestamps: true,}
)

const Message = mongoose.model("Message", messageSchema);

export default Message;