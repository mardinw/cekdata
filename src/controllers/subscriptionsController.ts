import type { Context, Next } from "hono";
import { getRequestLimit, getSubscriptionsByAdmin, getSubscriptionsByUUID, insertSubscriptions, setActiveSubscriptions, updateSubscriptions } from '../models/subscriptionsModel.js';
import type { ActivationRequest } from "../dtos/activationRequest.js";
import { decode } from "hono/jwt";
import { getRoleUser } from "../models/userModel.js";


export const createSubscriptions = async (ctx: Context, next: Next) => {
    
    // cek uuid yang login
    const uuid = ctx.req.query('uuid');
    const { request_limit } = await ctx.req.json();
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    const created_at = Math.floor(Date.now() / 1000);

    try {
        await insertSubscriptions(uuid, request_limit, created_at); 
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
        const reqBody : ActivationRequest = await ctx.req.json<ActivationRequest>();
        const {uuid, request_limit} = reqBody
        try {
            if (!uuid || typeof request_limit !== 'number') {
                return ctx.json({error: 'invalid input'}, 400);
            }

            await setActiveSubscriptions(request_limit, uuid);
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
    const uuid = ctx.req.query('uuid') as string;

    if(isAdmin[0].role === 'admin') {
        try {
            const res = await getSubscriptionsByAdmin();
            return ctx.json(res);
        } catch (error) {
            console.error(error);
            return ctx.json({error: 'internal server error'}, 500);
        }
    } else {
        try {
            const res = await getSubscriptionsByUUID(uuid);
            return ctx.json(res);
        } catch (error) {
            console.error(error);
            return ctx.json({error: 'internal server error'}, 500);
        }
    }

}

export const getRequestLimits = async(ctx: Context) => {
    const uuid = ctx.req.query('uuid') as string;
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    try {
        const res = await getRequestLimit(uuid);
        return ctx.json(res);
    } catch (error) {
        console.error(error);
        return ctx.json({error: error});
    }
}