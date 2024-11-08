import type { ResultSetHeader } from "mysql2";
import { db } from "../utils/db.js";
import cron from 'node-cron';

export const insertSessions = async(
    uuid: number,
    token: string,
    expireAt: number
) => {
    const query = 'INSERT INTO sessions (user_id, token, expires_at) VALUES( ?, ?, ?)';
    const [result] = await db.query(query, [uuid, token, expireAt] );
    return result;
}

export const deleteSessions = async(
    token: string
) => {
    const query = 'DELETE FROM sessions WHERE token = ?';
    const [result] = await db.query<ResultSetHeader>(query, [token]);

    if(result.affectedRows > 0) {
        return true;
    } else {
        return false
    }
}

export const findSessionByTokenId = async (token: string) : Promise<{expire_at: number} | null> => {
    const query = 'SELECT * FROM sessions WHERE token = ? LIMIT 1';
    const [result] = await db.query(query, [token]);

    if(Array.isArray(result) && result.length > 0) {
        return result[0] as { expire_at: number};
    } 
    return null;
}

export const findSessionByUserId = async(uuid: number): Promise<{token: string} | null> => {
    const query = 'SELECT token FROM sessions WHERE user_id = ? LIMIT 1';
    const [result] = await db.query(query, [uuid]);

    if(Array.isArray(result) && result.length > 0) {
        return result[0] as { token: string};
    }

    return null;
}

export const deleteExpiredSessions = async () => {
    const now = Math.floor(Date.now() / 1000);
    const query = 'DELETE FROM sessions WHERE expires_at < ?';
    await db.query(query, [now]);
}

// jadwal schedule auto delete
cron.schedule('0 * * * *', () => {
    console.log('Running scheduled job to delete expired sessions');
    deleteExpiredSessions();
})