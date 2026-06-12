const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticate = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validateCreateTask, validateUpdateTask } = require("../middleware/taskValidation");

router.post("/", authenticate, validateCreateTask, taskController.createTask);

router.get("/", authenticate, taskController.getAllTasks);
router.get("/my-tasks", authenticate, taskController.getMyTasks);
router.get("/filter", authenticate, taskController.getTasksByFilter);
router.get("/assigned/:userId", authenticate, taskController.getTasksByAssignee);
router.get("/:id", authenticate, taskController.getTaskById);

router.put("/:id", authenticate,validateUpdateTask, taskController.updateTask);

router.delete("/:id", authenticate, roleMiddleware("ADMIN"), taskController.deleteTask);

router.patch("/:id/assign", authenticate, roleMiddleware("ADMIN","COLLABORATOR"), taskController.assignTask);
router.patch("/:id/unassign", authenticate, roleMiddleware("ADMIN","COLLABORATOR"), taskController.unassignTask);
router.patch("/:id/status", authenticate, taskController.updateTaskStatus);
router.patch("/:id/priority", authenticate, taskController.updateTaskPriority);

module.exports = router;