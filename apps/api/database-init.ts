import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("🗑️  Dropping existing schema...");
    await client.query(`DROP SCHEMA public CASCADE;`);
    await client.query(`CREATE SCHEMA public;`);
    console.log("✅ Schema reset complete");

    console.log("\n📦 Creating User table...");
    await client.query(`
      CREATE TABLE "User" (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "emailVerified" BOOLEAN DEFAULT false NOT NULL,
        "loginAttempts" INTEGER DEFAULT 0 NOT NULL,
        "lockUntil" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("✅ User table created");

    console.log("\n📦 Creating Session table...");
    await client.query(`
      CREATE TABLE "Session" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "refreshToken" TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX "Session_userId_idx" ON "Session"("userId");
    `);
    console.log("✅ Session table created");

    console.log("\n📦 Creating File table...");
    await client.query(`
      CREATE TABLE "File" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER NOT NULL,
        "mimeType" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX "File_userId_idx" ON "File"("userId");
    `);
    console.log("✅ File table created");

    console.log("\n📊 Verifying tables...");
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n✨ Tables created:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log("\n🎉 Database setup complete!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase()
  .then(() => {
    console.log("\n✅ Done! You can now start your server.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Setup failed:", err);
    process.exit(1);
  });
