import { Hono } from "hono";
import { getAll, getMatch } from "../controllers/dptController.js";

const routes = new Hono();

routes.get('/alldpt', getAll);
routes.get('/match', getMatch)

export default routes;