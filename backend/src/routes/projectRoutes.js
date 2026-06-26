const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const ctrl = require("../controllers/projectController");

router.use(auth);
router.use(ensurePasswordChanged);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   get:
 *     summary: List all projects in a workspace
 *     description: Retrieves the list of projects created inside a specific workspace.
 *     tags: [Projects]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace UUID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, tasks, recent]
 *           default: recent
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get("/", ctrl.listProjects);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   post:
 *     summary: Create a new project in a workspace
 *     description: Adds a secondary project board inside a workspace.
 *     tags: [Projects]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mobile App Redesign
 *               description:
 *                 type: string
 *                 example: Secondary board for App Design deliverables
 *               color:
 *                 type: string
 *                 example: "#A855F7"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Project name is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.post("/", ctrl.createProject);

module.exports = router;
