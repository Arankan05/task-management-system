const taskService = require("../services/taskService");

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

    const tasks = await taskService.getAllTasks(filters);

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

    const updatedTask = await taskService.updateTask(id, {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedToId,
    });

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

    await taskService.deleteTask(id);

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

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};