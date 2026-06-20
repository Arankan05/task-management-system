const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const projectCtrl = require("../controllers/projectController");
const taskCtrl = require("../controllers/taskController");

router.use(auth);

router.get("/:id", projectCtrl.getProject);
router.put("/:id", projectCtrl.updateProject);
router.delete("/:id", projectCtrl.deleteProject);
router.get("/:id/stats", projectCtrl.getProjectStats);

router.get("/:projectId/tasks", taskCtrl.listTasks);
router.post("/:projectId/tasks", taskCtrl.createTask);
router.get("/:projectId/labels", taskCtrl.listLabels);
router.post("/:projectId/labels", taskCtrl.createLabel);

router.get("/tasks/:id", taskCtrl.getTask);
router.put("/tasks/:id", taskCtrl.updateTask);
router.patch("/tasks/:id/status", taskCtrl.updateTaskStatus);
router.delete("/tasks/:id", taskCtrl.deleteTask);

router.post("/tasks/:taskId/labels/:labelId", taskCtrl.addTaskLabel);
router.delete("/tasks/:taskId/labels/:labelId", taskCtrl.removeTaskLabel);
router.post("/tasks/:taskId/comments", taskCtrl.addComment);
router.post("/tasks/:taskId/attachments", taskCtrl.addAttachment);

module.exports = router;
