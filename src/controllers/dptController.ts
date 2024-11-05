import { getDataImport } from './../models/dataImport.js';
import type { Context } from "hono";
import { getMatchData } from '../models/matchData.js';

export const getAll = async (c: Context) => {
    const file = c.req.query('file');
    const user = c.req.query('user');

    const data = await getDataImport(file, user);
    return c.json(data);
};

export const getMatch = async (c: Context) => {
    const file = c.req.query('file');
    const user = c.req.query('user');

    const allMatchedData = [];

    // This is for get data from file import
    const dataImport = await getDataImport(file, user);

    // Condition for get piece item to match data on table dpt
    for( const item of dataImport) {
        const { nama, dob} = item;
        const matchedData = await getMatchData(nama, dob);
        allMatchedData.push(...matchedData);
    }

    // result all data match
    return c.json(allMatchedData);
};