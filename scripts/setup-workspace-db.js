/**
 * Sets up the Workspace → Project → Task database schema.
 *
 * Run from project root:
 *   node scripts/setup-workspace-db.js
 *
 * This will reset task-related data and apply the new schema.
 * User accounts (User table) are preserved.
 */
require("dotenv").config();
const { execSync } = require("child_process");
const prisma = require("../src/config/db");

async function main() {
  console.log("=== TASKPULSE Workspace DB Setup ===\n");

  try {
    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    await prisma.$executeRawUnsafe("DELETE FROM Attachment").catch(() => {});
    await prisma.$executeRawUnsafe("DELETE FROM Comment").catch(() => {});
    await prisma.$executeRawUnsafe("DELETE FROM Task").catch(() => {});
    await prisma.$executeRawUnsafe("DELETE FROM Label").catch(() => {});
    await prisma.$executeRawUnsafe("DELETE FROM Project").catch(() => {});
    await prisma.$executeRawUnsafe("DELETE FROM WorkspaceMember").catch(() => {});
    await prisma.$executeRawUnsafe("DELETE FROM Workspace").catch(() => {});
    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Cleared old task/project data.");
  } catch (err) {
    console.log("Note:", err.message);
  }

  await prisma.$disconnect();

  console.log("Applying Prisma schema...\n");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("\n✅ Database ready! Restart backend: npm run dev");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
