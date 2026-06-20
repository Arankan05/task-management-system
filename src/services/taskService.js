const prisma = require("../config/db");

const createTask = async (data) => {
  return await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdById: data.createdById,
      assignedToId: data.assignedToId || null,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
};

const getAllTasks = async (filters = {}, userId) => {
  return await prisma.task.findMany({
    where: {
      AND: [
        {
          OR: [
            { createdById: userId },
            { assignedToId: userId },
          ],
        },
        ...(filters.status ? [{ status: filters.status }] : []),
        ...(filters.priority ? [{ priority: filters.priority }] : []),
        ...(filters.assignedToId ? [{ assignedToId: filters.assignedToId }] : []),
      ],
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const userCanAccessTask = (task, userId) =>
  task &&
  (task.createdById === userId || task.assignedToId === userId);

const getTaskById = async (id) => {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
};

const updateTask = async (id, data) => {
  return await prisma.task.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.assignedToId !== undefined && {
        assignedToId: data.assignedToId,
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
};

const deleteTask = async (id) => {
  return await prisma.task.delete({
    where: { id },
  });
};

const assignTask = async (taskId, userId) => {
  return await prisma.task.update({
    where: {id: taskId},
    data: {assignedToId: userId},
    include: {
      createdBy: {select: {id:true, name:true, email:true}},
      assignedTo: {select: {id:true, name:true, email:true}},
    },
  });
};

const unassignTask = async (taskId) => {
  return await prisma.task.update({
    where: {id:taskId},
    data: {assignedToId: null},
    include: {
       createdBy: {select: {id:true, name:true, email:true}},
      assignedTo: {select: {id:true, name:true, email:true}},
    },
  });
};

const getTasksByAssignee = async (userId) => {
  return await prisma.task.findMany({
    where: { assignedToId: userId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getMyTasks = async (userId) => {
  return await getAllTasks({}, userId);
};

const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
};

const updateTaskStatus = async(id, status) => {
  return await prisma.task.update({
    where: {id},
    data: {status},
    include: {
      createdBy: {select: {id:true, name:true, email:true}},
      assignedTo: {select: {id:true, name:true, email:true}},
    },
  });
};

const updateTaskPriority = async (id, priority) => {
  return await prisma.task.update ({
    where: {id},
    data: {priority},
    include: {
      createdBy: {select: {id:true, name:true, email:true}},
      assignedTo: {select: {id:true, name:true, email:true}},
    },
  });
}

const getTasksByFilter = async (filters, userId) => {
  return await getAllTasks(filters, userId);
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
  getUserById,
  updateTaskStatus,
  updateTaskPriority,
  getTasksByFilter,
  userCanAccessTask,
};