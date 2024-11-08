import { getDataImport } from './../models/dataImport.js';
import type { Context } from "hono";
import { getMatchData } from '../models/matchData.js';

export const getAll = async (ctx: Context) => {
    const file = ctx.req.query('file');

    // cek uuid yang login
    const uuid = ctx.get('uuid');
    const data = await getDataImport(file, uuid);
    return ctx.json(data);
};

export const getMatch = async (ctx: Context) => {
    const file = ctx.req.query('file');

    // cek uuid yang login
    const uuid = ctx.get('uuid');

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