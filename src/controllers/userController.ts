import type { Context, Next } from "hono";
import bcrypt from 'bcrypt';
import { deleteUser, getRoleUser, listUser, loginUser, registerUser, updateUser } from "../models/userModel.js";
import { createToken } from "../helpers/token.js";
import { deleteSessions, findSessionByUserId, insertSessions } from "../models/sessionModel.js";
import { verify } from "hono/jwt";


const JWT_SECRET = process.env.JWT_SECRET as string;
// ubah menjadi 5 menit
const JWT_EXPIRATION = 5 * 60;

export const registerAccount = async( ctx: Context) => {
    const { username, password} = await ctx.req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    await registerUser(username, hashedPassword);

    return ctx.json({
        message: 'user registered successfully'
    });
}

export const loginAccount = async (ctx: Context) => {
    const {username, password} : {username: string; password: string} = await ctx.req.json();

    // cari user dari email
    const users = await loginUser(username);

    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return ctx.json({ message: 'invalid email or password'}, 401);
    }

    if (!user.is_active) {
        return ctx.json({ message: 'account is inactive'}, 403);
    }
    // periksa apakah user sudah memiliki sesi yang aktif
    let session = await findSessionByUserId(user.id);
    if(session) {
        return ctx.json({message: 'Login successful', token: session.token}, 200);
    }


    const expiresAt = Math.floor(Date.now() / 1000) + JWT_EXPIRATION;

    const token = await createToken(user.id, user.role, expiresAt, JWT_SECRET);

    // simpan token sesi ke database dengan format unixtimestamp
    const saveSession = await insertSessions(user.id, token, expiresAt);
    if (saveSession) {
        console.log('success insert session');
    } else {
        console.error('error', saveSession);
    }


    return ctx.json({ message: 'Login successful', token}, 200);
}

export const logoutAccount = async (ctx: Context) => {
    const token = await ctx.req.header('Authorization')?.split(' ')[1];

    if (token) {
        const result = await deleteSessions(token);
        if(result) {
            return ctx.json({message: 'Logout successful'});
        } else {
            return ctx.json({message: 'invalid token or session not found'}, 404);
        }
    } else {
        return ctx.json({message: 'no token provided'}, 400);
    }
}

export const listAccount = async (ctx: Context) => {
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }
    try {
        const result = await listUser();
        return ctx.json(result);        
    } catch (error) {
        console.error('error on process:', error);
        return ctx.json({message : error});
    }

}

export const deleteAccount = async (ctx: Context, next: Next) => {
    const uuid = ctx.get('uuid');
    const users = ctx.req.query('uuid') as string;

    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    let userRole = "";

    const roleIdCheck = await getRoleUser(uuid);
    roleIdCheck.forEach(user => {
        userRole = user.role;
    })

    if(users === uuid || userRole === 'admin' ) {
        try {
            await deleteUser(users);
            return ctx.json({message: 'delete user success'}, 200);
        } catch(error) {
            console.error('error on process delete:', error);
            return ctx.json({message: error});
        }
    } else {
        return ctx.json({message: 'forbidden access'}, 403)
    }
    
}

export const updateAccount = async( ctx: Context) => {
    const { username, password, role, isActive} = await ctx.req.json();
    const filter: {username?: string, password?: string, role?: string, isActive?: number} = {};
    const users = ctx.req.query('uuid') as string;

    // Hanya tambahkan nilai ke filter jika tidak undefined
    if (username) {
        filter.username = username;
    }

    if (password) {
        // Hash password jika ada nilai baru yang diberikan
        filter.password = await bcrypt.hash(password, 10);
    }

    if (role) {
        filter.role = role;
    }

    if(isActive) {
        filter.isActive = isActive;
    }

    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }
    
    let userRole = "";

    const roleIdCheck = await getRoleUser(uuid);
    roleIdCheck.forEach(user => {
        userRole = user.role;
    })

    if(users === uuid || userRole === 'admin' ) {
        try {
            await updateUser(filter, users);
            return ctx.json({message: 'update user success'}, 200);
        } catch(error) {
            console.error('error on process update:', error);
            return ctx.json({message: error});
        }
    }
}
