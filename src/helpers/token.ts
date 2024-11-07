import { sign } from "hono/jwt"


export const createToken = (uuid: number, expire_at: number, secret: any) : Promise<string> => {
    const token = sign({uuid, expire_at}, secret);

    return token;
}