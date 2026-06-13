const prisma = require("../config/db");

// Create Task
exports.createTask = async (req, res) => {
    try {
        const { title, description, priority } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority,

                createdBy: {
                    connect: {
                        id: 1
                    }
                }
            }
        });

        const io = req.app.get("io");

        io.to("project-room").emit("task-created", task);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error("TASK CREATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Update Task Status
exports.updateTask = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        const updatedTask = await prisma.task.update({
            where: {
                id: Number(id)
            },

            data: {
                status
            }
        });

        // Socket.IO realtime event
        const io = req.app.get("io");

        io.emit("task-updated", updatedTask);

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {

        console.error("TASK UPDATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};

// Delete Task
exports.deleteTask = async (req, res) => {

    try {

        const { id } = req.params;

        await prisma.task.delete({
            where: {
                id: Number(id)
            }
        });

        // Realtime event
        const io = req.app.get("io");

        io.emit("task-deleted", Number(id));

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.error("TASK DELETE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};