import mysql from "mysql2/promise";

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "hmong_dataset",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}

// User types
export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

// Find user by Google ID
export async function findUserByGoogleId(
  googleId: string,
): Promise<User | null> {
  const users = await query<User[]>("SELECT * FROM users WHERE google_id = ?", [
    googleId,
  ]);
  return users.length > 0 ? users[0] : null;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await query<User[]>("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return users.length > 0 ? users[0] : null;
}

// Create or update user from Google OAuth
export async function upsertUserFromGoogle(profile: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<User> {
  const existingUser = await findUserByGoogleId(profile.sub);

  if (existingUser) {
    // Update existing user
    await query(
      `UPDATE users SET email = ?, name = ?, avatar_url = ?, updated_at = NOW() WHERE google_id = ?`,
      [
        profile.email,
        profile.name || null,
        profile.picture || null,
        profile.sub,
      ],
    );
    return (await findUserByGoogleId(profile.sub))!;
  } else {
    // Create new user
    await query(
      `INSERT INTO users (google_id, email, name, avatar_url) VALUES (?, ?, ?, ?)`,
      [
        profile.sub,
        profile.email,
        profile.name || null,
        profile.picture || null,
      ],
    );
    return (await findUserByGoogleId(profile.sub))!;
  }
}

// Initialize database tables
export async function initDatabase(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_google_id (google_id),
      INDEX idx_email (email)
    )
  `);
}

export default pool;
