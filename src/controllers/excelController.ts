import type { Context } from "hono";

export const excelUpload = async(c: Context) => {
    const body = await c.req.parseBody();
    console.log(body['file']);
}