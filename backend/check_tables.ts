import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const checkTables = async () => {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    
    // Get all tables
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables in database:', tables);
    
    // Check each table's structure and data
    for (const table of tables) {
        console.log(`\n=== Table: ${table.name} ===`);
        
        // Get table schema
        const schema = await db.all(`PRAGMA table_info(${table.name})`);
        console.log('Schema:', schema);
        
        // Get row count
        const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`Row count: ${count.count}`);
        
        // Get sample data (first 5 rows)
        if (count.count > 0) {
            const rows = await db.all(`SELECT * FROM ${table.name} LIMIT 5`);
            console.log('Sample data:', rows);
        }
    }
    
    await db.close();
};

checkTables();
