const validateCreateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;

  // Title validation
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required and cannot be empty",
    });
  }

  if (title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Title must be at least 3 characters long",
    });
  }

  if (title.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Title cannot exceed 100 characters",
    });
  }

  // Status validation
  const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be TODO, IN_PROGRESS, or COMPLETED",
    });
  }

  // Priority validation
  const validPriorities = ["LOW", "MEDIUM", "HIGH"];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Invalid priority. Must be LOW, MEDIUM, or HIGH",
    });
  }

  // Due date validation
  if (dueDate) {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format",
      });
    }
    if (date < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be in the past",
      });
    }
  }

  // Clean the title (remove extra spaces)
  req.body.title = title.trim();
  next();
};

const validateUpdateTask = (req, res, next) => {
  const { title, status, priority, dueDate } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }
    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 3 characters long",
      });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 100 characters",
      });
    }
    req.body.title = title.trim();
  }

  const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be TODO, IN_PROGRESS, or COMPLETED",
    });
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH"];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Invalid priority. Must be LOW, MEDIUM, or HIGH",
    });
  }

  if (dueDate) {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format",
      });
    }
  }

  next();
};

module.exports = { validateCreateTask, validateUpdateTask };