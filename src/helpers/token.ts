import { sign } from "hono/jwt"


export const createToken = (uuid: string, role: string, expire_at: number, secret: any) : Promise<string> => {
    const token = sign({uuid, role, expire_at}, secret);

    return token;
}
