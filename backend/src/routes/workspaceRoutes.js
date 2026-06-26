const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const requireWorkspaceAdmin = require("../middleware/requireWorkspaceAdmin");
const validateAdminUser = require("../middleware/validateAdminUser");
const ctrl = require("../controllers/workspaceController");
const userCtrl = require("../controllers/userController");
const joinRequestCtrl = require("../controllers/joinRequestController");

router.use(auth);
router.use(ensurePasswordChanged);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: List all workspaces
 *     description: Retrieves the list of workspaces where the authenticated user is a member.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Workspaces fetched successfully
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Database schema outdated
 *       500:
 *         description: Internal server error
 */
router.get("/", ctrl.listWorkspaces);

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     description: Creates a workspace and registers the creator as the Owner/Administrator.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Development Team
 *               description:
 *                 type: string
 *                 example: Project workspace for Devs
 *               color:
 *                 type: string
 *                 example: "#7C3AED"
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Workspace name is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", ctrl.createWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   get:
 *     summary: Get workspace details
 *     description: Retrieves workspace parameters by ID. The user must be a workspace member.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     responses:
 *       200:
 *         description: Workspace fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (Not a workspace member)
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", ctrl.getWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   put:
 *     summary: Update workspace details
 *     description: Updates workspace metadata. Requires workspace administrator role.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.put("/:id", ctrl.updateWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}:
 *   delete:
 *     summary: Delete a workspace
 *     description: Deletes workspace, default project board, and member entries. Requires workspace administrator.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", ctrl.deleteWorkspace);

/**
 * @swagger
 * /api/workspaces/{id}/users:
 *   get:
 *     summary: List all users in a workspace (Admin view)
 *     description: Retrieves list of users with details for administration. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/:id/users", requireWorkspaceAdmin, userCtrl.listUsers);

/**
 * @swagger
 * /api/workspaces/{id}/users:
 *   post:
 *     summary: Create user and send welcome email (Admin operation)
 *     description: Manually registers a user account and invites them. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice Cooper
 *               email:
 *                 type: string
 *                 example: alice@example.com
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR]
 *                 example: COLLABORATOR
 *     responses:
 *       201:
 *         description: User created or invitation sent successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       409:
 *         description: Already a member
 *       500:
 *         description: Internal server error
 */
router.post("/:id/users", requireWorkspaceAdmin, validateAdminUser, userCtrl.createUser);

/**
 * @swagger
 * /api/workspaces/{id}/users/{userId}:
 *   patch:
 *     summary: Update workspace member details (Admin operation)
 *     description: Modifies member role or profile name. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR]
 *     responses:
 *       200:
 *         description: User details updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/users/:userId", requireWorkspaceAdmin, userCtrl.updateUser);

/**
 * @swagger
 * /api/workspaces/{id}/users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate workspace member (Admin operation)
 *     description: Suspends account logins and revokes refresh tokens. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member User UUID
 *     responses:
 *       200:
 *         description: User account deactivated successfully
 *       400:
 *         description: Cannot self-deactivate
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/users/:userId/deactivate", requireWorkspaceAdmin, userCtrl.deactivateUser);

/**
 * @swagger
 * /api/workspaces/{id}/users/{userId}/activate:
 *   patch:
 *     summary: Activate workspace member (Admin operation)
 *     description: Restores connection privileges for a deactivated user. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member User UUID
 *     responses:
 *       200:
 *         description: User account activated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/users/:userId/activate", requireWorkspaceAdmin, userCtrl.activateUser);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/join-requests:
 *   get:
 *     summary: List join requests for workspace
 *     description: Retrieves the pending list of requests to join the workspace.
 *     tags: [Workspaces]
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
 *         description: Join requests fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/:id/join-requests", joinRequestCtrl.listWorkspaceRequests);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/join-requests/{requestId}/recreate:
 *   post:
 *     summary: Recreate join request
 *     description: Resends or recreates a joining request.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recreated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:id/join-requests/:requestId/recreate", joinRequestCtrl.recreateRequest);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/join-requests/{requestId}:
 *   delete:
 *     summary: Cancel join request
 *     description: Deletes a pending join request.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cancelled successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete("/:id/join-requests/:requestId", joinRequestCtrl.cancelRequest);

/**
 * @swagger
 * /api/workspaces/{id}/members:
 *   get:
 *     summary: Get workspace members
 *     description: Retrieves the list of active members inside the workspace.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     responses:
 *       200:
 *         description: Workspace members fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/:id/members", ctrl.listMembers);

/**
 * @swagger
 * /api/workspaces/{id}/members:
 *   post:
 *     summary: Add member to workspace directly
 *     description: Instantly registers a registered user to the workspace. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: teammate@example.com
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR]
 *                 default: COLLABORATOR
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not registered in system
 *       500:
 *         description: Internal server error
 */
router.post("/:id/members", ctrl.addMember);

/**
 * @swagger
 * /api/workspaces/{id}/members/{userId}:
 *   patch:
 *     summary: Update member workspace role
 *     description: Changes the workspace role of a member. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMINISTRATOR, PROJECT_MANAGER, COLLABORATOR]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role or owner role alteration block
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/members/:userId", ctrl.updateMemberRole);

/**
 * @swagger
 * /api/workspaces/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from workspace
 *     description: Disconnects the user membership from the workspace. Requires workspace admin.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member User UUID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Cannot remove owner
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.delete("/:id/members/:userId", ctrl.removeMember);

/**
 * @swagger
 * /api/workspaces/{id}/tasks:
 *   get:
 *     summary: List tasks on default workspace board
 *     description: Retrieves the task array assigned to the default workspace project board.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignedToId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: labelId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace tasks fetched
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/:id/tasks", ctrl.listTasks);

/**
 * @swagger
 * /api/workspaces/{id}/tasks:
 *   post:
 *     summary: Create task on default workspace board
 *     description: Adds a new task directly inside the default workspace project board. Requires task management permissions.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete documentation
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 default: TODO
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *               progress:
 *                 type: integer
 *                 default: 0
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedToId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Task title required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.post("/:id/tasks", ctrl.createTask);

/**
 * @swagger
 * /api/workspaces/{id}/stats:
 *   get:
 *     summary: Get workspace default board stats
 *     description: Computes task statuses, priority distributions, and completion progress percentages for the default board.
 *     tags: [Workspaces]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/:id/stats", ctrl.getStats);

module.exports = router;
