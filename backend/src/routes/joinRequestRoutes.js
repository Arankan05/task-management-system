const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const joinRequestCtrl = require("../controllers/joinRequestController");

router.use(auth);
router.use(ensurePasswordChanged);

/**
 * @swagger
 * /api/join-requests/{id}/accept:
 *   post:
 *     summary: Accept workspace join request
 *     description: Approves a pending user request to join a workspace. Requires workspace admin.
 *     tags: [Join Requests]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Join Request UUID
 *     responses:
 *       200:
 *         description: Request accepted, user added to workspace members
 *       400:
 *         description: Request already resolved or invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/accept", joinRequestCtrl.acceptRequest);

/**
 * @swagger
 * /api/join-requests/{id}/reject:
 *   post:
 *     summary: Reject workspace join request
 *     description: Rejects a pending user request to join a workspace. Requires workspace admin.
 *     tags: [Join Requests]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Join Request UUID
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       400:
 *         description: Request already resolved or invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/reject", joinRequestCtrl.rejectRequest);

module.exports = router;
