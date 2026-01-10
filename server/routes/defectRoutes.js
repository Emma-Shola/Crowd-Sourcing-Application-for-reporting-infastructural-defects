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
const requireAdmin = require("../middleware/requireAdmin");

/* ===================== SPECIAL ROUTES FIRST ===================== */

// SEARCH (must come before :id)
router.get("/suggestions/search", auth, searchSuggestions);

// MARK COMMENTS AS READ
router.put("/:id/read-comments", auth, markCommentAsRead);

// ADMIN COMMENT
router.post("/:id/comment", auth, requireAdmin, addAdminComment);

// UPDATE STATUS (ADMIN / MOD)
router.put(
  "/:id/status",
  auth,
  roles("admin", "moderator"),
  updateStatus
);

/* ===================== CRUD ROUTES ===================== */

// CREATE
router.post(
  "/",
  auth,
  upload.array("images", 5),
  createDefect
);

// GET ALL
router.get("/", auth, getDefects);

// GET ONE
router.get("/:id", auth, getDefect);

// DELETE
router.delete("/:id", auth, deleteDefect);

module.exports = router;
