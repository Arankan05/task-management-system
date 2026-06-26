const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const projectCtrl = require("../controllers/projectController");
const projectMemberCtrl = require("../controllers/projectMemberController");
const taskCtrl = require("../controllers/taskController");

router.use(auth);
router.use(ensurePasswordChanged);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project details
 *     description: Retrieves details of a specific project board by ID.
 *     tags: [Projects]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", projectCtrl.getProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project details
 *     description: Modifies metadata of a project board.
 *     tags: [Projects]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, ARCHIVED]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", projectCtrl.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Removes a project and cascades deletions to all its tasks.
 *     tags: [Projects]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", projectCtrl.deleteProject);

/**
 * @swagger
 * /api/projects/{id}/stats:
 *   get:
 *     summary: Get project statistics
 *     description: Computes task status counts, priority distributions, and average progress metrics for a project.
 *     tags: [Projects]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project stats fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/stats", projectCtrl.getProjectStats);

router.get("/:id/members", projectMemberCtrl.listMembers);
router.post("/:id/members", projectMemberCtrl.addMember);
router.get("/:id/invitations", projectMemberCtrl.listInvitations);
router.post("/:id/invitations/:invitationId/resend", projectMemberCtrl.resendInvitation);
router.delete("/:id/members/:userId", projectMemberCtrl.removeMember);
router.get("/:id/my-role", projectMemberCtrl.getMyProjectRole);

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: List tasks in a project
 *     description: Retrieves the array of tasks belonging to a specific project.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
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
 *         description: Tasks fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:projectId/tasks", taskCtrl.listTasks);

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create task in project
 *     description: Creates a new task inside a specific project board.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
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
 *                 example: Draft API definitions
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
 *         description: Title is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.post("/:projectId/tasks", taskCtrl.createTask);

/**
 * @swagger
 * /api/projects/{projectId}/labels:
 *   get:
 *     summary: List project labels
 *     description: Retrieves the tags/labels defined inside a specific project.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Labels fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:projectId/labels", taskCtrl.listLabels);

/**
 * @swagger
 * /api/projects/{projectId}/labels:
 *   post:
 *     summary: Create project label
 *     description: Creates a new tag/label option inside a specific project.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project UUID
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
 *                 example: Bug
 *               color:
 *                 type: string
 *                 example: "#EF4444"
 *     responses:
 *       201:
 *         description: Label created successfully
 *       400:
 *         description: Name required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.post("/:projectId/labels", taskCtrl.createLabel);

/**
 * @swagger
 * /api/projects/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     description: Returns detailed parameters for a specific task.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     responses:
 *       200:
 *         description: Task fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get("/tasks/:id", taskCtrl.getTask);

/**
 * @swagger
 * /api/projects/tasks/{id}:
 *   put:
 *     summary: Update task details
 *     description: Replaces details of a task.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               progress:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedToId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put("/tasks/:id", taskCtrl.updateTask);

/**
 * @swagger
 * /api/projects/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     description: Changes task status and automatically sets progress.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.patch("/tasks/:id/status", taskCtrl.updateTaskStatus);

/**
 * @swagger
 * /api/projects/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Deletes a task by ID.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete("/tasks/:id", taskCtrl.deleteTask);

/**
 * @swagger
 * /api/projects/tasks/{taskId}/labels/{labelId}:
 *   post:
 *     summary: Add label to task
 *     description: Connects a label/tag to a task.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *       - in: path
 *         name: labelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Label UUID
 *     responses:
 *       200:
 *         description: Label added to task
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task or label not found
 *       500:
 *         description: Internal server error
 */
router.post("/tasks/:taskId/labels/:labelId", taskCtrl.addTaskLabel);

/**
 * @swagger
 * /api/projects/tasks/{taskId}/labels/{labelId}:
 *   delete:
 *     summary: Remove label from task
 *     description: Disconnects a label/tag from a task.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *       - in: path
 *         name: labelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Label UUID
 *     responses:
 *       200:
 *         description: Label removed from task
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task or label link not found
 *       500:
 *         description: Internal server error
 */
router.delete("/tasks/:taskId/labels/:labelId", taskCtrl.removeTaskLabel);

/**
 * @swagger
 * /api/projects/tasks/{taskId}/comments:
 *   post:
 *     summary: Add comment to task
 *     description: Appends a text comment to the task feed.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Excellent progress on this!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Content required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.post("/tasks/:taskId/comments", taskCtrl.addComment);

/**
 * @swagger
 * /api/projects/tasks/{taskId}/attachments:
 *   post:
 *     summary: Add attachment link to task
 *     description: Appends a file attachment reference.
 *     tags: [Tasks]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileUrl
 *               - fileType
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: spec.pdf
 *               fileUrl:
 *                 type: string
 *                 example: "data:application/pdf;base64,..."
 *               fileType:
 *                 type: string
 *                 example: application/pdf
 *     responses:
 *       201:
 *         description: Attachment added successfully
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.post("/tasks/:taskId/attachments", taskCtrl.addAttachment);

module.exports = router;
