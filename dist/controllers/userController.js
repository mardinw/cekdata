import { dataUser, deleteUser, getDataUsers, getRoleUser, listUser, loginUser, registerUser, updateUser } from "../models/userModel.js";
import { createToken } from "../helpers/token.js";
import { deleteSessions, findSessionByUserId, insertSessions } from "../models/sessionModel.js";
import crypto from 'crypto';
const JWT_SECRET = process.env.JWT_SECRET;
// ubah menjadi 5 menit
const JWT_EXPIRATION = 5 * 60;
const hashPassword = async (password, salt) => {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
};
const verifyPassword = async (inputPassword, storedHash, salt) => {
    const inputHash = hashPassword(inputPassword, salt);
    return await inputHash === storedHash;
};
export const registerAccount = async (ctx) => {
    const { username, password } = await ctx.req.json();
    const saltStored = crypto.randomBytes(16).toString('hex');
    const storedHash = await hashPassword(password, saltStored);
    await registerUser(username, storedHash, saltStored);
    return ctx.json({
        message: 'user registered successfully'
    });
};
export const loginAccount = async (ctx) => {
    const { username, password } = await ctx.req.json();
    // cari user dari email
    const users = await loginUser(username);
    const user = users[0];
    if (!user || !(await verifyPassword(password, user.password, user.salt))) {
        return ctx.json({ message: 'invalid email or password' }, 401);
    }
    if (!user.is_active) {
        return ctx.json({ message: 'account is inactive' }, 403);
    }
    // periksa apakah user sudah memiliki sesi yang aktif
    let session = await findSessionByUserId(user.id);
    if (session) {
        return ctx.json({ message: 'Login successful', token: session.token }, 200);
    }
    const expiresAt = Math.floor(Date.now() / 1000) + JWT_EXPIRATION;
    const token = await createToken(user.id, user.role, expiresAt, JWT_SECRET);
    // simpan token sesi ke database dengan format unixtimestamp
    const saveSession = await insertSessions(user.id, token, expiresAt);
    if (saveSession) {
        console.log('success insert session');
    }
    else {
        console.error('error', saveSession);
    }
    return ctx.json({ message: 'Login successful', token }, 200);
};
export const logoutAccount = async (ctx) => {
    const token = await ctx.req.header('Authorization')?.split(' ')[1];
    if (token) {
        const result = await deleteSessions(token);
        if (result) {
            return ctx.json({ message: 'Logout successful' });
        }
        else {
            return ctx.json({ message: 'invalid token or session not found' }, 404);
        }
    }
    else {
        return ctx.json({ message: 'no token provided' }, 400);
    }
};
export const listAccount = async (ctx) => {
    const uuid = ctx.get('uuid');
    if (!uuid) {
        return ctx.json({ message: 'uuid not found' }, 404);
    }
    try {
        const result = await listUser();
        return ctx.json(result);
    }
    catch (error) {
        console.error('error on process:', error);
        return ctx.json({ message: error });
    }
};
export const deleteAccount = async (ctx, next) => {
    const uuid = ctx.get('uuid');
    const users = ctx.req.query('uuid');
    if (!uuid) {
        return ctx.json({ message: 'uuid not found' }, 404);
    }
    let userRole = "";
    const roleIdCheck = await getRoleUser(uuid);
    roleIdCheck.forEach(user => {
        userRole = user.role;
    });
    if (users === uuid || userRole === 'admin') {
        try {
            await deleteUser(users);
            return ctx.json({ message: 'delete user success' }, 200);
        }
        catch (error) {
            console.error('error on process delete:', error);
            return ctx.json({ message: error });
        }
    }
    else {
        return ctx.json({ message: 'forbidden access' }, 403);
    }
};
export const updateAccount = async (ctx) => {
    const { username, password, role, is_active } = await ctx.req.json();
    const filter = {
        saltStored: ""
    };
    const users = ctx.req.query('uuid');
    const saltStored = crypto.randomBytes(16).toString('hex');
    // Hanya tambahkan nilai ke filter jika tidak undefined
    if (username) {
        filter.username = username;
    }
    if (password && saltStored) {
        filter.password = await hashPassword(password, saltStored);
        filter.saltStored = saltStored;
    }
    if (role) {
        filter.role = role;
    }
    if (is_active) {
        filter.is_active = is_active;
    }
    const uuid = ctx.get('uuid');
    if (!uuid) {
        return ctx.json({ message: 'uuid not found' }, 404);
    }
    let userRole = "";
    const roleIdCheck = await getRoleUser(uuid);
    roleIdCheck.forEach(user => {
        userRole = user.role;
    });
    if (users === uuid || userRole === 'admin') {
        try {
            await updateUser(filter, users);
            return ctx.json({ message: 'update user success' }, 200);
        }
        catch (error) {
            console.error('error on process update:', error);
            return ctx.json({ message: error });
        }
    }
};
export const dataAccount = async (ctx) => {
    const uuid = ctx.req.query('uuid');
    const fields = ctx.req.query('fields');
    let responseData = {};
    if (fields) {
        const fieldList = fields.split(',');
        const res = await getDataUsers(uuid);
        if (res && res[0]) {
            fieldList.forEach((field) => {
                if (res[0].hasOwnProperty(field)) {
                    responseData[field] = res[0][field];
                }
            });
        }
        else {
            return ctx.json({ message: 'user not found' });
        }
        return ctx.json(responseData);
    }
    else {
        return ctx.json(res[0]);
    }
};
