/**
 * Clears pending join requests, related notifications,
 * non-owner workspace members, and orphaned onboarding users.
 *
 * Usage: node scripts/clear-team-data.js
 */
require("dotenv").config();
const prisma = require("../src/config/db");

async function main() {
  const notif = await prisma.notification.deleteMany({
    where: { type: "WORKSPACE_JOIN_REQUEST" },
  });

  const requests = await prisma.workspaceJoinRequest.deleteMany({});

  const workspaces = await prisma.workspace.findMany({
    select: { id: true, ownerId: true },
  });

  const ownerIds = new Set(workspaces.map((w) => w.ownerId));
  let membersRemoved = 0;

  for (const ws of workspaces) {
    const result = await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId: ws.id,
        userId: { not: ws.ownerId },
      },
    });
    membersRemoved += result.count;
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  let usersRemoved = 0;

  for (const user of users) {
    if (ownerIds.has(user.id)) continue;

    const [memberCount, ownedCount, requestCount] = await Promise.all([
      prisma.workspaceMember.count({ where: { userId: user.id } }),
      prisma.workspace.count({ where: { ownerId: user.id } }),
      prisma.workspaceJoinRequest.count({ where: { userId: user.id } }),
    ]);

    if (memberCount === 0 && ownedCount === 0 && requestCount === 0) {
      const [projectCount, taskCreated, taskAssigned, commentCount] = await Promise.all([
        prisma.project.count({ where: { createdById: user.id } }),
        prisma.task.count({ where: { createdById: user.id } }),
        prisma.task.count({ where: { assignedToId: user.id } }),
        prisma.comment.count({ where: { userId: user.id } }),
      ]);

      const hasOtherData = projectCount + taskCreated + taskAssigned + commentCount > 0;

      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

      if (hasOtherData) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false },
        });
        usersRemoved += 1;
        continue;
      }

      try {
        await prisma.user.delete({ where: { id: user.id } });
        usersRemoved += 1;
      } catch {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false },
        });
        usersRemoved += 1;
      }
    }
  }

  console.log("Team data cleared:");
  console.log(`  Notifications removed: ${notif.count}`);
  console.log(`  Pending join requests removed: ${requests.count}`);
  console.log(`  Non-owner members removed: ${membersRemoved}`);
  console.log(`  Orphan users removed/deactivated: ${usersRemoved}`);
  console.log("Workspace owners were kept.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
