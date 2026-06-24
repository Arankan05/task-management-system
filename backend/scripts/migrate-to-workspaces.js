/**
 * Migrates from standalone Task model to Workspace → Project → Task hierarchy.
 * Run from backend: node scripts/migrate-to-workspaces.js
 */
require("dotenv").config();
const prisma = require("../src/config/db");

async function main() {
  console.log("Starting workspace migration...");

  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  console.log(`Found ${users.length} users`);

  const oldTasks = await prisma.$queryRawUnsafe(
    "SELECT id, title, description, status, priority, dueDate, assignedToId, createdById, createdAt, updatedAt FROM Task"
  ).catch(() => []);

  const taskRows = Array.isArray(oldTasks) ? oldTasks : [];
  console.log(`Found ${taskRows.length} existing tasks to migrate`);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM Attachment").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM Comment").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM TaskLabel").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM Label").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM Task").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM Project").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM WorkspaceMember").catch(() => {});
  await prisma.$executeRawUnsafe("DELETE FROM Workspace").catch(() => {});
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1").catch(() => {});

  for (const user of users) {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name.split(" ")[0]}'s Workspace`,
        description: "Default workspace",
        color: "#7C3AED",
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });

    const project = await prisma.project.create({
      data: {
        name: "General Project",
        description: "Default project for migrated tasks",
        color: "#A855F7",
        workspaceId: workspace.id,
        createdById: user.id,
      },
    });

    const userTasks = taskRows.filter(
      (t) => t.createdById === user.id || t.assignedToId === user.id
    );

    for (const t of userTasks) {
      const status = t.status === "COMPLETED" ? "DONE" : t.status || "TODO";
      await prisma.task.create({
        data: {
          id: t.id,
          title: t.title,
          description: t.description,
          status,
          priority: t.priority || "MEDIUM",
          dueDate: t.dueDate,
          projectId: project.id,
          assignedToId: t.assignedToId,
          createdById: t.createdById,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        },
      });
    }

    console.log(`  ${user.email}: workspace + project, migrated ${userTasks.length} tasks`);
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
