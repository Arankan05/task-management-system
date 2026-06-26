require("dotenv").config();
const prisma = require("../src/config/db");

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, isActive: true },
  });
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, name: true, ownerId: true },
  });
  const members = await prisma.workspaceMember.findMany({
    select: { id: true, workspaceId: true, userId: true, role: true },
  });
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, workspaceId: true },
  });
  const joinReqs = await prisma.workspaceJoinRequest.findMany({
    select: { id: true, workspaceId: true, userId: true, status: true },
  });

  console.log("=== USERS ===");
  console.log(JSON.stringify(users, null, 2));
  console.log("=== WORKSPACES ===");
  console.log(JSON.stringify(workspaces, null, 2));
  console.log("=== WORKSPACE MEMBERS ===");
  console.log(JSON.stringify(members, null, 2));
  console.log("=== PROJECTS ===");
  console.log(JSON.stringify(projects, null, 2));
  console.log("=== JOIN REQUESTS ===");
  console.log(JSON.stringify(joinReqs, null, 2));

  const memberWsIds = new Set(members.map((m) => m.workspaceId));
  const orphan = workspaces.filter((w) => !memberWsIds.has(w.id));
  console.log("=== ORPHAN WORKSPACES (no WorkspaceMember row) ===");
  console.log(JSON.stringify(orphan, null, 2));

  for (const ws of workspaces) {
    const ownerMember = members.find(
      (m) => m.workspaceId === ws.id && m.userId === ws.ownerId
    );
    if (!ownerMember) {
      console.log(`MISSING OWNER MEMBER: workspace "${ws.name}" ownerId=${ws.ownerId}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
