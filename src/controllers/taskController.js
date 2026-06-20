const taskService = require("../services/taskService");

const emitToTaskUsers = (io, event, payload) => {
  const task = payload.task || payload;
  const userIds = new Set(
    [task?.createdById, task?.assignedToId].filter(Boolean)
  );
  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(event, payload);
  });
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId } =
      req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const task = await taskService.createTask({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedToId,
      createdById: req.user.id,
    });

    // Emit only to creator and assignee
    const io = req.app.get("io");
    emitToTaskUsers(io, "task:created", { task });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assignedToId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedToId) filters.assignedToId = assignedToId;

    const tasks = await taskService.getAllTasks(filters, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message,
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await taskService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!taskService.userCanAccessTask(task, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve task",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } =
      req.body;

    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!taskService.userCanAccessTask(existingTask, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

    const updatedTask = await taskService.updateTask(id, {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedToId,
    });

    // Emit only to creator and assignee
    const io = req.app.get("io");
    emitToTaskUsers(io, "task:updated", { task: updatedTask });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!taskService.userCanAccessTask(existingTask, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

    await taskService.deleteTask(id);

    const io = req.app.get("io");
    emitToTaskUsers(io, "task:deleted", { taskId: id, task: existingTask });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const {id} = req.params;
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!taskService.userCanAccessTask(existingTask, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

     const userExists = await taskService.getUserById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const task = await taskService.assignTask(id, userId);

    const io = req.app.get("io");
    io.to(`user:${userId}`).emit("task:assigned", { task });
    if (task.createdById !== userId) {
      io.to(`user:${task.createdById}`).emit("task:updated", { task });
    }

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:"Failed to assign task",
      error: error.message,
    });
  }
};

const unassignTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!taskService.userCanAccessTask(existingTask, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task",
      });
    }

    const task = await taskService.unassignTask(id);

    return res.status(200).json({
      success: true,
      message: "Task unassigned successfully",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unassign task",
      error: error.message,
    });
  }
};

const getTasksByAssignee = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own assigned tasks",
      });
    }

    const userExists = await taskService.getUserById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tasks = await taskService.getTasksByAssignee(userId);

    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      count: tasks.length,
      data: tasks,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks",
      error: error.message,
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await taskService.getMyTasks(userId);

    return res.status(200).json({
      success: true,
      message: "Your tasks retrieved successfully",
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
     return res.status(500).json({
      success: false,
      message: "Failed to retrieve your tasks",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be TODO, IN_PROGRESS, or COMPLETED",
      });
    }

    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!taskService.userCanAccessTask(existingTask, req.user.id)) {
      return res.status(403).json({ success: false, message: "You do not have access to this task" });
    }

    const task = await taskService.updateTaskStatus(id, status);
    return res.status(200).json({ success: true, message: "Task status updated successfully", data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update task status", error: error.message });
  }
};

const updateTaskPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be LOW, MEDIUM, or HIGH",
      });
    }

    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!taskService.userCanAccessTask(existingTask, req.user.id)) {
      return res.status(403).json({ success: false, message: "You do not have access to this task" });
    }

    const task = await taskService.updateTaskPriority(id, priority);
    return res.status(200).json({ success: true, message: "Task priority updated successfully", data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update task priority", error: error.message });
  }
};

const getTasksByFilter = async (req, res) => {
  try {
    const { status, priority, assignedToId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedToId) filters.assignedToId = assignedToId;

    const tasks = await taskService.getTasksByFilter(filters, req.user.id);
    return res.status(200).json({ success: true, message: "Tasks retrieved successfully", count: tasks.length, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve tasks", error: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getTasksByAssignee,
  getMyTasks,
  updateTaskStatus,
  updateTaskPriority,
  getTasksByFilter,
};