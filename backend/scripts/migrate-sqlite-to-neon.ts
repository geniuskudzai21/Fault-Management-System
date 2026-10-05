import 'dotenv/config';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { ensureSchema } from '../src/db/postgres';

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'database.sqlite');

type SqliteRow = Record<string, unknown>;

const toTimestamp = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;

  let text = String(value).trim();
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(text)) {
    text = text.includes('T') ? `${text}Z` : `${text.replace(' ', 'T')}Z`;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toJson = (value: unknown): unknown => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return String(value).toLowerCase() === 'true';
};

type ColumnSpec = {
  name: string;
  transform?: (value: unknown) => unknown;
};

type TableSpec = {
  table: string;
  columns: ColumnSpec[];
  fk?: { column: string; references: string }[];
};

const TABLES: TableSpec[] = [
  {
    table: 'users',
    columns: [
      { name: 'id' },
      { name: 'name' },
      { name: 'email' },
      { name: 'password' },
      { name: 'role' },
      { name: 'status' },
      { name: 'area' },
      { name: 'phone' },
      { name: 'address' },
      { name: 'employee_id' },
      { name: 'created_at', transform: toTimestamp },
    ],
  },
  {
    table: 'faults',
    fk: [
      { column: 'customer_id', references: 'users' },
      { column: 'technician_id', references: 'users' },
    ],
    columns: [
      { name: 'id' },
      { name: 'customer_id' },
      { name: 'technician_id' },
      { name: 'status' },
      { name: 'address' },
      { name: 'category' },
      { name: 'priority' },
      { name: 'description' },
      { name: 'area' },
      { name: 'reported_date', transform: toTimestamp },
      { name: 'assigned_date', transform: toTimestamp },
      { name: 'resolved_date', transform: toTimestamp },
      { name: 'fault_number' },
      { name: 'gps_location', transform: toJson },
      { name: 'photos', transform: toJson },
      { name: 'signature', transform: toJson },
      { name: 'resolution_data', transform: toJson },
      { name: 'customer_feedback', transform: toJson },
    ],
  },
  {
    table: 'load_shedding_schedules',
    columns: [
      { name: 'id' },
      { name: 'area' },
      { name: 'start_time' },
      { name: 'end_time' },
      { name: 'date' },
      { name: 'status' },
      { name: 'reason' },
      { name: 'affected_customers' },
      { name: 'alternative_supply', transform: toBoolean },
      { name: 'notes' },
      { name: 'created_at', transform: toTimestamp },
      { name: 'updated_at', transform: toTimestamp },
    ],
  },
  {
    table: 'fault_reports',
    fk: [
      { column: 'customer_id', references: 'users' },
      { column: 'assigned_technician_id', references: 'users' },
    ],
    columns: [
      { name: 'id' },
      { name: 'customer_id' },
      { name: 'customer_name' },
      { name: 'customer_email' },
      { name: 'customer_phone' },
      { name: 'area' },
      { name: 'address' },
      { name: 'category' },
      { name: 'priority' },
      { name: 'description' },
      { name: 'reported_date', transform: toTimestamp },
      { name: 'status' },
      { name: 'assigned_technician_id' },
      { name: 'assigned_technician_name' },
      { name: 'admin_notes' },
      { name: 'estimated_resolution_time' },
      { name: 'actual_resolution_time' },
      { name: 'gps_location', transform: toJson },
      { name: 'photos', transform: toJson },
    ],
  },
];

const sqliteTables = (db: DatabaseSync): Set<string> => {
  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all() as SqliteRow[];
  return new Set(rows.map((row) => String(row.name)));
};

const migrate = async () => {
  const sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });
  const available = sqliteTables(sqlite);
  const db = await ensureSchema();

  try {
    for (const spec of TABLES) {
      if (!available.has(spec.table)) {
        console.log(`- ${spec.table}: not present in SQLite, skipping`);
        continue;
      }

      const rows = sqlite.prepare(`SELECT * FROM ${spec.table}`).all() as SqliteRow[];
      const already = await db.all(`SELECT id FROM ${spec.table}`);
      const present = new Set(already.map((row: any) => Number(row.id)));

      const names = spec.columns.map((column) => `"${column.name}"`).join(', ');
      const placeholders = spec.columns.map(() => '?').join(', ');

      let inserted = 0;
      let skipped = 0;

      for (const row of rows) {
        const id = Number(row.id);
        if (present.has(id)) {
          skipped += 1;
          continue;
        }

        const params = spec.columns.map((column) => {
          const raw = row[column.name];
          const value = column.transform ? column.transform(raw) : raw === undefined ? null : raw;
          if (value === undefined) return null;
          return value;
        });

        for (const fk of spec.fk ?? []) {
          const index = spec.columns.findIndex((column) => column.name === fk.column);
          const target = await db.get(`SELECT id FROM ${fk.references} WHERE id = ?`, [
            params[index] as number,
          ]);
          if (params[index] !== null && !target) {
            console.warn(
              `  ! ${spec.table}#${id}: ${fk.column} = ${params[index]} has no matching user, setting NULL`
            );
            params[index] = null;
          }
        }

        await db.run(`INSERT INTO ${spec.table} (${names}) VALUES (${placeholders})`, params);
        present.add(id);
        inserted += 1;
      }

      console.log(`- ${spec.table}: ${inserted} inserted, ${skipped} skipped, ${rows.length} total in SQLite`);
    }

    for (const spec of TABLES) {
      await db.run(
        `SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE((SELECT MAX(id) FROM ${spec.table}), 0) + 1, false)`,
        [spec.table]
      );
    }

    console.log('\nIdentity sequences reset. Migration complete.');
  } finally {
    sqlite.close();
    await db.close();
  }
};

migrate().catch((error) => {
  console.error('\nMigration failed:', error);
  process.exit(1);
});
