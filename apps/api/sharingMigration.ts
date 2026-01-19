import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function createSharingTables() {
  const client = await pool.connect();

  try {
    console.log("Connected to database");
    console.log("\nCreating file_shares table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS file_shares (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        file_id INTEGER NOT NULL,
        owner_id TEXT NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('link', 'email', 'internal')),
        permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'comment', 'edit', 'download')),
        password TEXT,
        expires_at TIMESTAMP,
        max_downloads INTEGER,
        download_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT file_shares_file_id_fkey FOREIGN KEY (file_id) 
          REFERENCES user_files(id) ON DELETE CASCADE,
        CONSTRAINT file_shares_owner_id_fkey FOREIGN KEY (owner_id) 
          REFERENCES "User"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares(file_id);
      CREATE INDEX IF NOT EXISTS idx_file_shares_owner_id ON file_shares(owner_id);
      CREATE INDEX IF NOT EXISTS idx_file_shares_token ON file_shares(share_token);
      CREATE INDEX IF NOT EXISTS idx_file_shares_active ON file_shares(is_active) WHERE is_active = true;
    `);

    console.log("file_shares table created");

    console.log("\nCreating share_recipients table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS share_recipients (
        id SERIAL PRIMARY KEY,
        share_id TEXT NOT NULL,
        recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'email', 'anyone')),
        recipient_user_id TEXT,
        recipient_email TEXT,
        permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'comment', 'edit', 'download')),
        notified BOOLEAN DEFAULT false,
        last_accessed TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT share_recipients_share_id_fkey FOREIGN KEY (share_id) 
          REFERENCES file_shares(id) ON DELETE CASCADE,
        CONSTRAINT share_recipients_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) 
          REFERENCES "User"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_share_recipients_share_id ON share_recipients(share_id);
      CREATE INDEX IF NOT EXISTS idx_share_recipients_user_id ON share_recipients(recipient_user_id);
      CREATE INDEX IF NOT EXISTS idx_share_recipients_email ON share_recipients(recipient_email);
    `);

    console.log("share_recipients table created");

    console.log("\nCreating share_activity table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS share_activity (
        id SERIAL PRIMARY KEY,
        share_id TEXT NOT NULL,
        user_id TEXT,
        action VARCHAR(50) NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT share_activity_share_id_fkey FOREIGN KEY (share_id) 
          REFERENCES file_shares(id) ON DELETE CASCADE,
        CONSTRAINT share_activity_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES "User"(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_share_activity_share_id ON share_activity(share_id);
      CREATE INDEX IF NOT EXISTS idx_share_activity_created_at ON share_activity(created_at DESC);
    `);

    console.log("share_activity table created");

    console.log("\nCreating trigger for updated_at...");

    await client.query(`
      CREATE TRIGGER update_file_shares_updated_at 
        BEFORE UPDATE ON file_shares
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("Trigger created");

    console.log("\nVerifying tables...");
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('file_shares', 'share_recipients', 'share_activity')
      ORDER BY table_name;
    `);

    console.log("\nSharing tables created:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log("\n✅ File sharing schema setup complete!");
  } catch (error) {
    console.error("Error setting up sharing tables:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

console.log("Setting up file sharing tables...");
createSharingTables()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Setup failed:", err);
    process.exit(1);
  });
