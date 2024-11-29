import { db } from "../utils/db";

export const insertSubscriptions = async(
    uuid: string,
    request_limit: number,
    createdAt: number,
) => {
    const query = 'INSERT INTO subscriptions(users, request_limit, created_at) VALUES(?, ?, ?)';
    const [result]  =  await db.query(query, [uuid, request_limit, createdAt]);
    return result;
}

export const updateSubscriptions = async(
    uuid: string,
    limit_active: number,
    is_active: number,
    createdAt: number,
) => {
    const query = 
    `
    UPDATE subscriptions
    SET limit_active = ? ,
    is_active = ? ,
    created_at = ?
    WHERE users = ?
    `

    const [result]  =  await db.query(query, [limit_active, is_active, createdAt, uuid]);
    return result;
}

export const setActiveSubscriptions = async(
    request_limit: number,
    uuid: string,
) => {
    const query = 'UPDATE subscriptions SET limit_active = ?, request_limit = 0 WHERE users = ?';
    const [result] = await db.query(query, [request_limit, uuid]);
    return result;
}

export const getSubscriptionsByUUID = async(
    uuid: string,
) => {
    const query = 'SELECT limit_active, request_limit FROM subscriptions WHERE users = ?';
    const [result] = await db.query(query, uuid);
    return result;
}

export const getSubscriptionsByAdmin = async() => {
    const query = 'SELECT t1.users as uuid, t2.name as name, t1.limit_active as limit_active, t1.request_limit as request_limit, t1.created_at FROM subscriptions t1 INNER JOIN users t2 ON t2.id = t1.users GROUP BY t1.users';
    const [result] = await db.query(query);
    return result;
}

export const getRequestLimit = async(
    uuid: string
) => {
    const query = 'SELECT request_limit FROM subscriptions WHERE users = ?';
    const [result] = await db.query(query, [uuid]);
    return result;
}