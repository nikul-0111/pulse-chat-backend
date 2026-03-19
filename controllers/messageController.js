import Message from "../models/Message.js";

// GET /api/messages/:userId  — get conversation between me and another user
export const getConversation = async (req, res) => {
  try {
    const me    = req.user._id;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: me,    receiverId: other },
        { senderId: other, receiverId: me    },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/messages/read/:senderId  — mark all messages from sender as read
export const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        senderId:   req.params.senderId,
        receiverId: req.user._id,
        status:     { $ne: "read" },
      },
      { status: "read" }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
