import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { findSessionByTokenId} from "../models/sessionModel.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware = async(ctx: Context, next: Next) => {
    const authorization = ctx.req.header('Authorization');
    if(!authorization || !authorization.startsWith('Bearer ')) {
        return ctx.json({message: 'Unathorized'}, 401);
    }

    const token = authorization.split(' ')[1];
    const session = await findSessionByTokenId(token);
    const decoded = await verify(token, JWT_SECRET);
    ctx.set('uuid', decoded.uuid);
     
    if(!session || session.expire_at < Math.floor(Date.now()/ 1000)) {
        return ctx.json({ message: 'invalid or expired token'}, 401);
    }

    await next();
}