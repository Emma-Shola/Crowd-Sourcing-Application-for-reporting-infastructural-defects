const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = user.generateJWT();

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = user.generateJWT();

    res.json({
  success: true,
  token,
  user: {
    id: user._id,
    email: user.email,
    role: user.role
  }
});

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
