/**
 * Repairs missing WorkspaceMember rows.
 * Workspaces only appear on the website when a user has a WorkspaceMember record.
 *
 * Usage (from backend): node scripts/repair-workspace-members.js
 */
require("dotenv").config();
const prisma = require("../src/config/db");
const { WORKSPACE_ROLES } = require("../src/utils/workspaceRoles");

async function main() {
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, name: true, ownerId: true },
  });

  let created = 0;

  for (const ws of workspaces) {
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: ws.id, userId: ws.ownerId },
      },
    });

    if (!existing) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: ws.id,
          userId: ws.ownerId,
          role: WORKSPACE_ROLES.ADMINISTRATOR,
        },
      });
      console.log(`+ Owner member: "${ws.name}" → owner ${ws.ownerId}`);
      created++;
    }
  }

  const accepted = await prisma.workspaceJoinRequest.findMany({
    where: { status: "ACCEPTED" },
    select: { workspaceId: true, userId: true, role: true },
  });

  for (const req of accepted) {
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: req.workspaceId, userId: req.userId },
      },
    });

    if (!existing) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: req.workspaceId,
          userId: req.userId,
          role: req.role,
        },
      });
      console.log(`+ Accepted join: user ${req.userId} → workspace ${req.workspaceId}`);
      created++;
    }
  }

  const total = await prisma.workspaceMember.count();
  console.log(`\nDone. Created ${created} member row(s). Total members: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
