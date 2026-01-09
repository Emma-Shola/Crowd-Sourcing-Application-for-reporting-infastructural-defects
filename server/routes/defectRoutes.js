const express = require("express");
const router = express.Router();

const {
  createDefect,
  getDefects,
  getDefect,
  updateStatus,
  deleteDefect,
  searchSuggestions,
   addAdminComment,
   markCommentAsRead
} = require("../controllers/defectController");

const auth = require("../middleware/auth");
const roles = require("../middleware/roles");
const upload = require("../middleware/upload");

// CREATE
router.post("/", auth, upload.array("images", 6)   // allow up to 6 images
, createDefect);

// GET all
router.get("/", auth, getDefects);

// GET one
router.get("/:id", auth, getDefect);

// UPDATE STATUS (ADMIN ONLY)
router.put(
  "/:id/status",
  auth,
  roles("admin", "moderator"),
  updateStatus
);

// DELETE
router.delete("/:id", auth, deleteDefect);

router.get("/suggestions/search", auth, searchSuggestions);


const requireAdmin = require("../middleware/requireAdmin");

router.post("/:id/comment", auth, requireAdmin, addAdminComment);

// Add this import at the top:


// Add this route (for regular users to mark comments as read):
router.put("/:id/read-comments", auth, markCommentAsRead);

module.exports = router;
