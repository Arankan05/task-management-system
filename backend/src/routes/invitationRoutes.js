const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const ctrl = require("../controllers/invitationController");

const protectedRoute = [auth, ensurePasswordChanged];

/**
 * @swagger
 * /api/invitations/workspace/{workspaceId}:
 *   get:
 *     summary: List invitations by workspace
 *     description: Retrieves the list of sent workspace invitations. Requires workspace admin.
 *     tags: [Invitations]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     responses:
 *       200:
 *         description: Workspace invitations fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
router.get("/workspace/:workspaceId", protectedRoute, ctrl.listByWorkspace);

/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Create workspace invitation
 *     description: Sends a workspace invitation via email and creates a pending invitation record. Requires workspace admin.
 *     tags: [Invitations]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - email
 *               - role
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 example: workspace-uuid
 *               email:
 *                 type: string
 *                 example: colleague@example.com
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR]
 *                 example: COLLABORATOR
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       400:
 *         description: Invalid role or email format, or workspace owner invitation block
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Workspace not found
 *       409:
 *         description: Pending invitation already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", protectedRoute, ctrl.createInvitation);

/**
 * @swagger
 * /api/invitations/{id}/resend:
 *   post:
 *     summary: Resend workspace invitation
 *     description: Regenerates the token key, extends the expiration date, and sends the invitation email again. Requires workspace admin.
 *     tags: [Invitations]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation UUID
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *       400:
 *         description: Cannot resend accepted or cancelled invitations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/resend", protectedRoute, ctrl.resendInvitation);

/**
 * @swagger
 * /api/invitations/{id}/cancel:
 *   delete:
 *     summary: Cancel workspace invitation
 *     description: Updates invitation status to CANCELLED, preventing the recipient from accepting it. Requires workspace admin.
 *     tags: [Invitations]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation UUID
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
 *       400:
 *         description: Cannot cancel an already accepted invitation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id/cancel", protectedRoute, ctrl.cancelInvitation);

/**
 * @swagger
 * /api/invitations/{token}/accept:
 *   post:
 *     summary: Accept workspace invitation
 *     description: Registers the authenticated user as a member of the workspace, assigning the role from the invitation.
 *     tags: [Invitations]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation hex token
 *     responses:
 *       200:
 *         description: Invitation accepted successfully, workspace member created
 *       400:
 *         description: Invitation already accepted, cancelled, or expired
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invitation was sent to a different email address
 *       404:
 *         description: Invitation or user not found
 *       409:
 *         description: Already a member of this workspace
 *       500:
 *         description: Internal server error
 */
router.post("/:token/accept", protectedRoute, ctrl.acceptInvitation);

/**
 * @swagger
 * /api/invitations/{token}:
 *   get:
 *     summary: Get invitation details by token
 *     description: Fetches invitation details to display on the acceptance screen. Does not require login.
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation hex token
 *     responses:
 *       200:
 *         description: Invitation details fetched successfully
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal server error
 */
router.get("/:token", ctrl.getByToken);

module.exports = router;
