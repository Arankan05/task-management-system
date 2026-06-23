const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const joinRequestCtrl = require("../controllers/joinRequestController");

router.use(auth);
router.use(ensurePasswordChanged);

router.post("/:id/accept", joinRequestCtrl.acceptRequest);
router.post("/:id/reject", joinRequestCtrl.rejectRequest);

module.exports = router;
