import { getDataImport } from './../models/dataImport.js';
import type { Context } from "hono";
import { getAllDPT, getDPTByNameAndNik } from "../models/dptModel.js";
import { getMatchData } from '../models/matchData.js';

export const getAll = async (c: Context) => {
    const file = c.req.query('file');
    const user = c.req.query('user');

    const data = await getDataImport(file, user);
    return c.json(data);
};

export const getNameAndNik = async (c: Context) => {
    const name = c.req.query('nama');
    const nik = c.req.query('nik');

    const data = await getDPTByNameAndNik(name, nik);
    console.log(data);
    return c.json(data);
}

export const getMatch = async (c: Context) => {
    const file = c.req.query('file');
    const user = c.req.query('user');

    const dataImport = await getDataImport(file, user);
    for( const item of dataImport) {
        const { nama, dob} = item;
        const matchedData = await getMatchData(nama, dob);
        console.log(matchedData);
    }
    return c.json(dataImport);
};