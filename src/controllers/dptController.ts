import { getDataImport } from './../models/dataImport.js';
import type { Context } from "hono";
import { getMatchData } from '../models/matchData.js';


export const getMatch = async (ctx: Context) => {
    const file = ctx.req.query('file');

    // cek uuid yang login
    const uuid = ctx.get('uuid');
    if(!uuid) {
        return ctx.json({message: 'uuid not found'}, 404);
    }

    const allMatchedData = [];

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
};