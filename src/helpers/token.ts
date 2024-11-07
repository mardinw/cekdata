import { sign } from "hono/jwt"


export const createToken = (user_id: number, expire_at: number, secret: any) : Promise<string> => {
    const token = sign({user_id, expire_at}, secret);

    return token;
}