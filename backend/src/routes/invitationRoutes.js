const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const ctrl = require("../controllers/invitationController");

const protectedRoute = [auth, ensurePasswordChanged];

router.get("/workspace/:workspaceId", protectedRoute, ctrl.listByWorkspace);
router.post("/", protectedRoute, ctrl.createInvitation);
router.post("/:id/resend", protectedRoute, ctrl.resendInvitation);
router.delete("/:id/cancel", protectedRoute, ctrl.cancelInvitation);
router.post("/:token/accept", protectedRoute, ctrl.acceptInvitation);

router.get("/:token", ctrl.getByToken);

module.exports = router;
