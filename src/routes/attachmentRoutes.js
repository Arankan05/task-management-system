const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  uploadAttachment,
  getAttachments,
} = require("../controllers/attachmentController");

router.get("/:taskId/attachments",  authMiddleware, getAttachments);
router.post("/:taskId/attachments", authMiddleware, upload.single("file"), uploadAttachment);

module.exports = router;