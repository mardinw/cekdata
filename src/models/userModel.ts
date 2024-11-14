import type { RowDataPacket } from "mysql2";
import { db } from "../utils/db.js";
import { randomUUID } from "crypto";

export const registerUser = async (
    name: string, 
    password: string,
) => {
    const userId = randomUUID();
    const query = 'INSERT INTO users (id, name, password, role, is_active) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [userId, name, password, 'user', '0']);
    return result;
}

export const loginUser = async (
    username: string
) => {
    const query = 'SELECT * FROM users WHERE name = ?';
    const [result] = await db.query<RowDataPacket[]>(query, username);
   
    return result;
}

export const updateUserPassword = async (password: string, uuid: string) => {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    const [result] = await db.query(query, [password, uuid]);
    return result;
}

export const deleteUser = async (uuid: string) => {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.query(query, uuid);
    return result;
}

export const listUser = async () => {
    const query = 'SELECT id as uuid, name, role, is_active FROM users';
    const [result] = await db.query<RowDataPacket[]>(query);
    return result;
}
