// Example: server/controllers/userController.js
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ email: user.email, ...user.toObject() });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};