import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    receiverId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    // ✅ Changed required to false so you can send a photo WITHOUT text
    text: { 
      type: String, 
      required: false, 
      trim: true 
    },
    // ✅ NEW FIELD: Added imageUrl to store the photo data/link
    imageUrl: { 
      type: String, 
      required: false 
    },
    status: { 
      type: String, 
      enum: ["sent", "delivered", "read"], 
      default: "sent" 
    },
  },
  { timestamps: true }
);

// Index for fast conversation queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: 1 }); // Useful for sorting by time

const Message = mongoose.model("Message", messageSchema);
export default Message;