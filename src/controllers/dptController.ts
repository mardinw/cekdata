import { getDataImport } from './../models/dataImport.js';
import type { Context } from "hono";
import { getMatchData } from '../models/matchData.js';
import { decode } from 'hono/jwt';
import { getRoleUser } from '../models/userModel.js';


export const getMatch = async (ctx: Context) => {
    const file = ctx.req.query('file');

    // cek uuid yang login
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    const allMatchedData = [];
   
    // if user is admin
    const authorization = ctx.req.header('Authorization');
    if(!authorization || !authorization.startsWith('Bearer ')) {
        return ctx.json({message: 'Unathorized'}, 401);
    }

    const token = authorization.split(' ')[1];
    const { payload} = decode(token);
    const isAdmin = await getRoleUser(`${payload.uuid}`);

    if(isAdmin[0].role === 'admin' || uuid) {
        // This is for get data from file import
        const dataImport = await getDataImport(file, uuid);

        // Condition for get piece item to match data on table dpt
        for( const item of dataImport) {
            const { nama, ttl} = item;
            const matchedData = await getMatchData(nama, ttl);
            allMatchedData.push(...matchedData);
        }

        // result all data match
        return ctx.json(allMatchedData);

    } else {
        return ctx.json({message: 'forbidden access'}, 403);
    }
};