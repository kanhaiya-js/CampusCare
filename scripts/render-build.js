const { execSync } = require("child_process");

// Set internal file database default if not configured in environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

console.log("==> [1/3] Generating Prisma Client for internal SQLite database...");
execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: "inherit" });

console.log("==> [2/3] Syncing internal file database schema...");
try {
  execSync("npx prisma db push --schema=prisma/schema.prisma --accept-data-loss", { stdio: "inherit" });
  console.log("==> [2.5/3] Checking if database needs initial seeding...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} catch (err) {
  console.warn("==> DB sync/seed note:", err.message);
}

console.log("==> [3/3] Building Next.js application...");
execSync("next build", { stdio: "inherit" });
