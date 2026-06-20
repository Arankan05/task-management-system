const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/invitationController");

router.get("/workspace/:workspaceId", auth, ctrl.listByWorkspace);

router.post("/", auth, ctrl.createInvitation);

router.post("/:id/resend", auth, ctrl.resendInvitation);
router.delete("/:id/cancel", auth, ctrl.cancelInvitation);

router.get("/:token", ctrl.getByToken);
router.post("/:token/accept", auth, ctrl.acceptInvitation);

module.exports = router;
