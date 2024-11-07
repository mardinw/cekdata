import { getDataImport } from './../models/dataImport.js';
import type { Context } from "hono";
import { getMatchData } from '../models/matchData.js';

export const getAll = async (c: Context) => {
    const file = c.req.query('file');

    // cek uuid yang login
    const uuid = c.get('uuid');
    const data = await getDataImport(file, uuid);
    return c.json(data);
};

export const getMatch = async (c: Context) => {
    const file = c.req.query('file');

    // cek uuid yang login
    const uuid = c.get('uuid');

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
    return c.json(allMatchedData);
};