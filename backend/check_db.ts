
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const check = async () => {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
    const users = await db.all('SELECT id, name, email, role FROM users');
    console.log('Registered Users:', users);
    await db.close();
};

check();
