import type { Context } from "hono";
import { getSubscriptionsByAdmin, insertSubscriptions, setActiveSubscriptions } from '../models/subscriptionsModel.js';
import type { ActivationRequest } from "../dtos/activationRequest.js";
import { decode } from "hono/jwt";
import { getRoleUser } from "../models/userModel.js";


export const createSubscriptions = async (ctx: Context) => {
    
    // cek uuid yang login
    const uuid = ctx.req.query('uuid');
    const { limit_count, is_active  } = await ctx.req.json();
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    const created_at = Math.floor(Date.now() / 1000);

    try {
        await insertSubscriptions(uuid, limit_count, is_active, created_at); 
        return ctx.json({message: 'subscriptions sedang kami proses'});
        
    } catch (error) {
        console.error(error);
        return ctx.text(`${error}`);
    }
};

export const activationSubscriptions = async(ctx : Context) => {
    const authorization = ctx.req.header('Authorization');
    if(!authorization || !authorization.startsWith('Bearer ')) {
        return ctx.json({message: 'Unathorized'}, 401);
    }

    const token = authorization.split(' ')[1];
    const { payload} = decode(token);
    const isAdmin = await getRoleUser(`${payload.uuid}`);
    // cek role is admin
    if(isAdmin[0].role === 'admin') {
        try {
            const reqBody : ActivationRequest = await ctx.req.json<ActivationRequest>();
            const {uuid, is_active} = reqBody
            if (!uuid || typeof is_active !== 'boolean') {
                return ctx.json({error: 'invalid input'}, 400);
            }

            await setActiveSubscriptions(is_active, uuid);
            return ctx.json({message : 'subscription update success'})
        } catch (error) {
            console.error(error);
            return ctx.json({error: 'internal server error'}, 500);
        }
    } else {
        return ctx.json({error: 'permission denied'}, 403)
    }
}

export const getSubscriptions = async(ctx: Context) => {
    const authorization = ctx.req.header('Authorization');
    if(!authorization || !authorization.startsWith('Bearer ')) {
        return ctx.json({message: 'Unathorized'}, 401);
    }

    const token = authorization.split(' ')[1];
    const { payload} = decode(token);
    const isAdmin = await getRoleUser(`${payload.uuid}`);
    
    if(isAdmin[0].role === 'admin') {
        try {
            const res = await getSubscriptionsByAdmin();
            return ctx.json(res);
        } catch (error) {
            console.error(error);
            return ctx.json({error: 'internal server error'}, 500);
        }
    } else {
        return ctx.json({error: 'permission denied'}, 403)
    }

}