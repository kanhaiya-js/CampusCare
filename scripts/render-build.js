const { execSync } = require("child_process");

console.log("==> [1/3] Generating Prisma Client...");
execSync("npx prisma generate --schema=prisma/schema.prisma", { stdio: "inherit" });

if (process.env.DATABASE_URL) {
  console.log("==> [2/3] DATABASE_URL detected. Syncing schema to PostgreSQL...");
  try {
    execSync("npx prisma db push --schema=prisma/schema.prisma --accept-data-loss", { stdio: "inherit" });
    console.log("==> [2.5/3] Running automated initial database seed...");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  } catch (err) {
    console.warn("==> DB sync/seed warning (non-fatal):", err.message);
  }
} else {
  console.log("==> [2/3] DATABASE_URL not set yet. Skipping DB push and seed.");
}

console.log("==> [3/3] Building Next.js application...");
execSync("next build", { stdio: "inherit" });
