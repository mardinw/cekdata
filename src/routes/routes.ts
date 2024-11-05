import { Hono } from "hono";
import { getAll, getMatch } from "../controllers/dptController.js";
import { excelUpload } from "../controllers/excelController.js";

const routes = new Hono();

routes.get('/alldpt', getAll);
routes.get('/match', getMatch);
routes.post('/upload', excelUpload);

export default routes;