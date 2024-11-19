import {} from "mysql2";
import { db } from "../utils/db.js";
import { randomUUID } from "crypto";
export const registerUser = async (name, password, saltStored) => {
    const userId = randomUUID();
    const query = 'INSERT INTO users (id, name, password, salt, role, is_active) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [userId, name, password, saltStored, 'user', '0']);
    return result;
};
export const loginUser = async (username) => {
    const query = 'SELECT * FROM users WHERE name = ?';
    const [result] = await db.query(query, username);
    return result;
};
export const deleteUser = async (uuid) => {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.query(query, uuid);
    return result;
};
export const getRoleUser = async (uuid) => {
    const query = 'SELECT role from users where id = ?';
    const [result] = await db.query(query, uuid);
    return result;
};
export const listUser = async () => {
    const query = 'SELECT id as uuid, name, role, is_active FROM users';
    const [result] = await db.query(query);
    return result;
};
export const updateUser = async (filter, uuid) => {
    let query = 'UPDATE users';
    let params = [];
    if (filter) {
        const conditions = [];
        if (filter.username !== undefined) {
            conditions.push('name = ?');
            params.push(filter.username);
        }
        if (filter.password !== undefined && filter.saltStored !== undefined) {
            conditions.push('password = ?, salt =  ?');
            params.push(filter.password, filter.saltStored);
        }
        if (filter.role !== undefined) {
            conditions.push('role = ?');
            params.push(filter.role);
        }
        if (filter.is_active !== undefined) {
            conditions.push('is_active = ?');
            params.push(filter.is_active);
        }
        if (conditions.length > 0) {
            query += ' SET ' + conditions.join(', ');
        }
    }
    // cek kondisi jika uuid tersedia
    if (uuid) {
        query += ' WHERE id = ?';
        params.push(uuid);
    }
    else {
        throw new Error('UUID is required to update user.');
    }
    // eksekusi query
    const [rows] = await db.query(query, params);
    return rows;
};
export const dataUser = async (filter, uuid) => {
    let query = 'SELECT';
    if (filter) {
        const conditions = [];
        if (filter.username !== undefined) {
            conditions.push('name');
        }
        if (filter.role !== undefined) {
            conditions.push('role');
        }
        if (filter.is_active !== undefined) {
            conditions.push('is_active');
        }
        if (conditions.length > 0) {
            query += conditions.join(', ');
        }
    }
    // cek kondisi jika uuid tersedia
    query += 'FROM users WHERE id = ?';
    // eksekusi query
    const [rows] = await db.query(query, uuid);
    return rows;
};
export const getDataUsers = async (uuid) => {
    const query = 'SELECT name as username, role, is_active FROM `users` WHERE id = ?';
    const [rows] = await db.query(query, uuid);
    return rows;
};