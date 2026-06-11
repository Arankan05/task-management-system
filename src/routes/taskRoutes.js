const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/authMiddleware");
const { validateCreateTask, validateUpdateTask } = require("../middleware/taskValidation");

router.post("/", authenticate, taskController.createTask);

router.get("/", authenticate, taskController.getAllTasks);
router.get("/my-tasks", authenticate, taskController.getMyTasks);
router.get("/filter", authenticate, taskController.getTasksByFilter);
router.get("/assigned/:userId", authenticate, taskController.getTasksByAssignee);
router.get("/:id", authenticate, taskController.getTaskById);

router.put("/:id", authenticate, taskController.updateTask);

router.delete("/:id", authenticate, taskController.deleteTask);

router.patch("/:id/assign", authenticate, taskController.assignTask);
router.patch("/:id/unassign", authenticate, taskController.unassignTask);
router.patch("/:id/status", authenticate, taskController.updateTaskStatus);
router.patch("/:id/priority", authenticate, taskController.updateTaskPriority);

module.exports = router;