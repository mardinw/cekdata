import { sign } from "hono/jwt";
export const createToken = (uuid, role, expire_at, secret) => {
    const token = sign({ uuid, role, expire_at }, secret);
    return token;
};
