import type { Context } from "hono";
import bcrypt from 'bcrypt';
import { loginUser, registerUser } from "../models/userModel.js";
import { createToken } from "../helpers/token.js";
import { deleteSessions, findSessionByUserId, insertSessions } from "../models/sessionModel.js";
import { verify } from "hono/jwt";


const JWT_SECRET = process.env.JWT_SECRET as string;
// ubah menjadi 5 menit
const JWT_EXPIRATION = 5 * 60;

export const registerAccount = async( c: Context) => {
    const { username, email, password} = await c.req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    await registerUser(username, email, hashedPassword);

    return c.json({
        message: 'user registered successfully'
    });
}

export const loginAccount = async (c: Context) => {
    const {email, password} : {email: string; password: string} = await c.req.json();

    // cari user dari email
    const users = await loginUser(email);

    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return c.json({ message: 'invalid email or password'}, 401);
    }

    if (!user.is_active) {
        return c.json({ message: 'account is inactive'}, 403);
    }
    // periksa apakah user sudah memiliki sesi yang aktif
    let session = await findSessionByUserId(user.id);
    if(session) {
        return c.json({message: 'Login successful', token: session.token}, 200);
    }


    const expiresAt = Math.floor(Date.now() / 1000) + JWT_EXPIRATION;

    const token = await createToken(user.id, expiresAt, JWT_SECRET);

    // simpan token sesi ke database dengan format unixtimestamp
    const saveSession = await insertSessions(user.id, token, expiresAt);
    if (saveSession) {
        console.log('success insert session');
    } else {
        console.error('error', saveSession);
    }


    return c.json({ message: 'Login successful', token}, 200);
}

export const logoutAccount = async (c: Context) => {
    const token = await c.req.header('Authorization')?.split(' ')[1];

    if (token) {
        const result = await deleteSessions(token);
        if(result) {
            return c.json({message: 'Logout successful'});
        } else {
            return c.json({message: 'invalid token or session not found'}, 404);
        }
    } else {
        return c.json({message: 'no token provided'}, 400);
    }
}