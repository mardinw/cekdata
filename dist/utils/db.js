import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();
export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});
// function to check if the connection is successfull
const checkConnection = async () => {
    try {
        await db.getConnection();
        console.log('Database connection successfull');
    }
    catch (error) {
        console.error('Database connection failed:', error);
    }
};
checkConnection();
