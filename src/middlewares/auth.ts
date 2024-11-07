import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { findSessionByTokenId, findSessionByUserId } from "../models/sessionModel.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = async(c: Context, next: Next) => {
    const authorization = c.req.header('Authorization');
    if(!authorization || !authorization.startsWith('Bearer ')) {
        return c.json({message: 'Unathorized'}, 401);
    }

    const token = authorization.split(' ')[1];
    const session = await findSessionByTokenId(token);
    if(!session || session.expire_at < Math.floor(Date.now()/ 1000)) {
        return c.json({ message: 'invalid or expired token'}, 401);
    }

    await next();
}