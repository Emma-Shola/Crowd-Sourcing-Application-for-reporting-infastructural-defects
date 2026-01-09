const Defect = require("../models/Defect");

// @desc   Create new report
// @route  POST /api/defects
// @access Private
// @desc   Create new report
// @route  POST /api/defects
// @access Private
exports.createDefect = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    let { title, description, type, location } = req.body;

    // ---- handle location safely ----
    let parsedLocation = null;

    if (location) {
      try {
        parsedLocation =
          typeof location === "string" ? JSON.parse(location) : location;
      } catch {
        parsedLocation = { text: location };
      }
    }

    if (!title || !description || !parsedLocation?.text) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }

    // 👇 collect all uploaded files
    const imagePaths = req.files?.length
      ? req.files.map(f => `/uploads/${f.filename}`)
      : [];

    const defect = await Defect.create({
      title,
      description,
      type,
      location: {
        text: parsedLocation.text,
        latitude: parsedLocation.latitude || null,
        longitude: parsedLocation.longitude || null,
      },

      // 👇 save as ARRAY
      imageUrl: imagePaths,

      reportedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: defect });
  } catch (err) {
    console.error("CREATE DEFECT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc   Get all reports
// @route  GET /api/defects
// @access Private
// @desc   Get all reports
// @route  GET /api/defects
// @access Private
// @desc   Get all reports (paginated)
// @route  GET /api/defects?page=1&limit=6
// @access Private
exports.getDefects = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search = req.query.search || "";

    let query = {};

    // not admin → only their reports
    if (req.user.role !== "admin") {
      query.reportedBy = req.user.id;
    }

    // search title OR description
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const totalItems = await Defect.countDocuments(query);

    const defects = await Defect.find(query)
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: defects,
      page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (err) {
    console.error("GET DEFECTS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// @desc   Get single report
// @route  GET /api/defects/:id
// @access Private
exports.getDefect = async (req, res) => {
  try {
    const defect = await Defect.findById(req.params.id)
      .populate("reportedBy", "name email role");

    if (!defect) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    // only owner OR admin can view
    if (defect.reportedBy._id.toString() !== req.user.id &&
        req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: defect });
  } catch (err) {
    console.error("GET DEFECT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc   Update status
// @route  PUT /api/defects/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "pending",
      "verified",
      "in_progress",
      "resolved",
      "rejected",
    ];

    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!defect)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    res.json({ success: true, data: defect });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc   Delete a report
// @route  DELETE /api/defects/:id
// @access Private (owner or admin)
exports.deleteDefect = async (req, res) => {
  try {
    const defect = await Defect.findById(req.params.id);

    if (!defect) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // only owner or admin
    if (defect.reportedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this report",
      });
    }

    await defect.deleteOne();

    res.json({ success: true, message: "Report deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.searchSuggestions = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const results = await Defect.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { "location.text": { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
      ],
    }).select("title location type").limit(10);

    const suggestions = [
      ...new Set(
        results.flatMap((r) => [
          r.title,
          r.location?.text,
          r.type,
        ])
      ),
    ].filter(Boolean);

    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.addAdminComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const defect = await Defect.findById(id).populate("reportedBy");

    if (!defect) {
      return res.status(404).json({ message: "Report not found" });
    }

    // add comment from admin
    defect.adminComments.push({
      message,
      admin: req.user.id
    });

    // create notification
    defect.notifications.push({
      text: `Admin commented: ${message}`
    });

    await defect.save();

    res.json({
      success: true,
      message: "Comment added and user notified in app",
      data: defect
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.markCommentAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const defect = await Defect.findById(id);

    if (!defect) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user owns this defect
    if (defect.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Mark all notifications as read
    defect.notifications.forEach(notif => {
      notif.read = true;
    });

    await defect.save();
    
    res.json({ success: true, message: "Comments marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
