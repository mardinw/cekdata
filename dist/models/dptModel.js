import { db } from "../utils/db.js";
export const getAllDPT = async () => {
    const [rows] = await db.query('SELECT * FROM dpt_kpu LIMIT 100');
    return rows;
};
export const getDPTByNameAndNik = async (nama, nik) => {
    const [rows] = await db.query('SELECT nik, nama, kecamatan, kelurahan FROM dpt_kpu WHERE nama LIKE ? AND nik LIKE ?', [`${nama}%`, `%${nik}%`]);
    return rows;
};
