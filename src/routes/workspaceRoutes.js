const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/workspaceController");

router.use(auth);

router.get("/", ctrl.listWorkspaces);
router.post("/", ctrl.createWorkspace);
router.get("/:id", ctrl.getWorkspace);
router.put("/:id", ctrl.updateWorkspace);
router.delete("/:id", ctrl.deleteWorkspace);

router.get("/:id/members", ctrl.listMembers);
router.post("/:id/members", ctrl.addMember);
router.patch("/:id/members/:userId", ctrl.updateMemberRole);
router.delete("/:id/members/:userId", ctrl.removeMember);

router.get("/:id/tasks", ctrl.listTasks);
router.post("/:id/tasks", ctrl.createTask);
router.get("/:id/stats", ctrl.getStats);

module.exports = router;
