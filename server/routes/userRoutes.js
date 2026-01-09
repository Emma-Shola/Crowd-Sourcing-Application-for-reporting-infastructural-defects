const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

// Protected route — only works if token is valid
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
