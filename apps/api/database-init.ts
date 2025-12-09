import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting database initialization...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_files (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        s3_key VARCHAR(1000) NOT NULL UNIQUE,
        folder_path VARCHAR(1000),
        size BIGINT NOT NULL,
        mime_type VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created user_files table");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_files_user_email ON user_files(user_email);
    `);
    console.log("Created index on user_email");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_files_folder_path ON user_files(folder_path);
    `);
    console.log("Created index on folder_path");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON user_files(created_at);
    `);
    console.log("Created index on created_at");

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log("Created updated_at trigger function");

    await client.query(`
      DROP TRIGGER IF EXISTS update_user_files_updated_at ON user_files;
      CREATE TRIGGER update_user_files_updated_at 
      BEFORE UPDATE ON user_files
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("Created updated_at trigger");

    console.log("");
    console.log("Database initialization completed successfully!");
    console.log("");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log("Database setup complete. You can now start your server.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database setup failed:", err);
    process.exit(1);
  });
