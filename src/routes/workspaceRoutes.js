const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const requireWorkspaceAdmin = require("../middleware/requireWorkspaceAdmin");
const validateAdminUser = require("../middleware/validateAdminUser");
const ctrl = require("../controllers/workspaceController");
const userCtrl = require("../controllers/userController");

router.use(auth);
router.use(ensurePasswordChanged);

router.get("/", ctrl.listWorkspaces);
router.post("/", ctrl.createWorkspace);
router.get("/:id", ctrl.getWorkspace);
router.put("/:id", ctrl.updateWorkspace);
router.delete("/:id", ctrl.deleteWorkspace);

router.get("/:id/users", requireWorkspaceAdmin, userCtrl.listUsers);
router.post("/:id/users", requireWorkspaceAdmin, validateAdminUser, userCtrl.createUser);
router.patch("/:id/users/:userId", requireWorkspaceAdmin, userCtrl.updateUser);
router.patch("/:id/users/:userId/deactivate", requireWorkspaceAdmin, userCtrl.deactivateUser);
router.patch("/:id/users/:userId/activate", requireWorkspaceAdmin, userCtrl.activateUser);

router.get("/:id/members", ctrl.listMembers);
router.post("/:id/members", ctrl.addMember);
router.patch("/:id/members/:userId", ctrl.updateMemberRole);
router.delete("/:id/members/:userId", ctrl.removeMember);

router.get("/:id/tasks", ctrl.listTasks);
router.post("/:id/tasks", ctrl.createTask);
router.get("/:id/stats", ctrl.getStats);

module.exports = router;
