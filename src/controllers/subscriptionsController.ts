import type { Context } from "hono";
import { insertSubscriptions, setActiveSubscriptions } from '../models/subscriptionsModel.js';
import type { ActivationRequest } from "../dtos/activationRequest.js";
import { error } from "console";


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
    try {
        const reqBody : ActivationRequest = await ctx.req.json<ActivationRequest>();
        const {uuid, is_active} = reqBody
        if (!uuid || typeof is_active !== 'boolean') {
            return ctx.json({error: 'invalid input'}, 400);
        }

        await setActiveSubscriptions(is_active, uuid);
        return ctx.json({message : 'subscription activate success'})
    } catch (error) {
        console.error(error);
        return ctx.json({error: 'interal server error'}, 500);
    }
}