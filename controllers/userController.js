import User from "../models/User.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/status/:id
export const getStatus = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  try {
    const target = await User.findById(id);

    if (!target) return res.status(404).json({ message: "User not found" });

    if (currentUser.following.includes(target._id)) return res.json({ status: "friends" });
    if (currentUser.requests.includes(target._id)) return res.json({ status: "requested" });
    if (target.requests.includes(currentUser._id)) return res.json({ status: "pending" });

    res.json({ status: "none" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/request/:id
export const sendRequest = async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  try {
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (!target.requests.includes(currentUser._id)) target.requests.push(currentUser._id);
    await target.save();

    res.json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/accept/:id
export const acceptRequest = async (req, res) => {
  const { id } = req.params; // id of user who sent the request
  const currentUser = req.user;

  try {
    const sender = await User.findById(id);
    if (!sender) return res.status(404).json({ message: "User not found" });

    // Remove from requests
    currentUser.requests = currentUser.requests.filter(
      (uid) => uid.toString() !== sender._id.toString()
    );

    // Add followers/following
    if (!currentUser.following.includes(sender._id)) currentUser.following.push(sender._id);
    if (!sender.followers.includes(currentUser._id)) sender.followers.push(currentUser._id);

    await currentUser.save();
    await sender.save();

    res.json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/reject/:id
export const rejectRequest = async (req, res) => {
  const { id } = req.params; // id of user who sent the request
  const currentUser = req.user;

  try {
    currentUser.requests = currentUser.requests.filter(
      (uid) => uid.toString() !== id
    );
    await currentUser.save();
    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};