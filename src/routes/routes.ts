import { Hono } from "hono";
import { getAll, getMatch, getNameAndNik } from "../controllers/dptController.js";

const routes = new Hono();

routes.get('/alldpt', getAll);
routes.get('/check', getNameAndNik);
routes.get('/match', getMatch)

export default routes;