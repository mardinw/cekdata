import type { Context, Next } from "hono";
import { deleteUser, getDataUsers, getRoleUser, listUser, loginUser, registerUser, updateUser } from "../models/userModel.js";
import { createToken } from "../helpers/token.js";
import { deleteSessions, findSessionByUserId, insertSessions } from "../models/sessionModel.js";
import crypto, { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET as string;
// ubah menjadi 5 menit
const JWT_EXPIRATION = 5 * 60;

const hashPassword = async (password: string, salt: string) : Promise<string> => {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
}

const verifyPassword = async (inputPassword: string, storedHash: string, salt:string ): Promise<boolean> => {
    const inputHash = hashPassword(inputPassword, salt);
    return await inputHash === storedHash;
}

export const registerAccount = async( ctx: Context) => {
    const { username, password} = await ctx.req.json();
    const saltStored: string = crypto.randomBytes(16).toString('hex');

    const storedHash: string =  await hashPassword(password, saltStored);
    const uuid = randomUUID();
    await registerUser( uuid, username, storedHash, saltStored);

    return ctx.json({
        message: 'user registered successfully'
    });
}

export const loginAccount = async (ctx: Context) => {
    const {username, password} : {username: string; password: string} = await ctx.req.json();

    // cari user dari email
    const users = await loginUser(username);

    const user = users[0];

    if(!user || !(await verifyPassword(password, user.password, user.salt))) {
        return ctx.json({message: 'invalid email or password'}, 401);
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
    const { username, password, role, is_active} = await ctx.req.json();
    const users = ctx.req.query('uuid') as string;
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    const filter: {
        username?: string, 
        password?: string, 
        saltStored?: string, 
        role?: string, 
        is_active?: number
    } = {};

    if(password) {
        const saltStored: string = crypto.randomBytes(16).toString('hex');
        filter.password = await hashPassword(password, saltStored);
        filter.saltStored = saltStored;
    }

    // Hanya tambahkan nilai ke filter jika tidak undefined
    if (username)filter.username = username;
    if(role) filter.role = role;
    if(is_active !== undefined) filter.is_active = is_active;

    let userRole = "";
     try {
        const roleIdCheck = await getRoleUser(uuid);
        if (roleIdCheck.length > 0) {
            userRole = roleIdCheck[0]?.role || '';
        }

        console.log('Filter:', filter);

        if (users === uuid || userRole === 'admin') {
            await updateUser(filter, users);
            return ctx.json({ message: 'Update user success' }, 200);
        } else {
            return ctx.json({ message: 'Unauthorized access' }, 403);
        }
    } catch (error) {
        console.error('Error during update:', error);

        // Pastikan pesan error aman untuk ditampilkan
        return ctx.json(
            { message: 'Failed to update user. Please contact support.' },
            500
        );
    }
}

// export const dataAccount = async( ctx: Context) => {
//     const uuid = ctx.req.query('uuid');

//     const fields = ctx.req.query('fields');

//     let responseData: any = {};

//     if(fields) {
//         const fieldList = fields.split(',');
//         const res = await getDataUsers(uuid);
//         console.log(res);
//         if(res && res[0]) {
//             fieldList.forEach((field) => {
//                 if(res[0].hasOwnProperty(field)) {
//                     responseData[field] = res[0][field];
//                 }
//             });
//         } else {
//             return ctx.json({message: 'user not found'});
//         }
//         return ctx.json(responseData);
//     } else {
//         return ctx.json(res[0]);
//     }

// }
export const dataAccount = async (ctx: Context) => {
    try {
        const uuid = ctx.req.query('uuid');
        const fields = ctx.req.query('fields');

        // Validasi input UUID
        if (!uuid) {
            return ctx.json({ message: 'UUID is required' }, 400);
        }

        // Ambil data pengguna berdasarkan UUID
        const userData = await getDataUsers(uuid);

        if (!userData || !userData[0]) {
            return ctx.json({ message: 'User not found' }, 404);
        }

        const user = userData[0]; // Data user yang ditemukan

        // Jika 'fields' tersedia, hanya kembalikan data berdasarkan field yang diminta
        if (fields) {
            const fieldList = fields.split(',');
            const responseData = fieldList.reduce((result: Record<string, any>, field) => {
                if (field in user) {
                    result[field] = user[field];
                }
                return result;
            }, {});

            return ctx.json(responseData);
        }

        // Jika 'fields' tidak tersedia, kembalikan seluruh data pengguna
        return ctx.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return ctx.json({ message: 'Internal Server Error' }, 500);
    }
};
