import 'dotenv/config';
import { neon, escapeIdentifier } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const sql = neon(connectionString);

const checkTables = async () => {
  const tables = await sql`
    SELECT tablename AS name
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  console.log('Tables in database:', tables.map((table: any) => table.name));

  for (const table of tables) {
    const quoted = escapeIdentifier(table.name);
    console.log(`\n=== Table: ${table.name} ===`);

    const schema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table.name}
      ORDER BY ordinal_position
    `;
    console.log('Schema:', schema);

    const count = await sql.unsafe(`SELECT COUNT(*)::int as count FROM ${quoted}`);
    console.log(`Row count: ${count[0].count}`);

    if (count[0].count > 0) {
      const rows = await sql.unsafe(`SELECT * FROM ${quoted} LIMIT 5`);
      console.log('Sample data:', rows);
    }
  }
};

checkTables().catch((error) => {
  console.error(error);
  process.exit(1);
});
