import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const sql = neon(connectionString);

const check = async () => {
  const users = await sql`SELECT id, name, email, role FROM users ORDER BY id`;
  console.log('Registered Users:', users);
};

check().catch((error) => {
  console.error(error);
  process.exit(1);
});
