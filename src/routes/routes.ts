import { Hono } from "hono";
import { getAll, getMatch } from "../controllers/dptController.js";
import { excelUpload } from "../controllers/excelController.js";
import { loginAccount, logoutAccount, registerAccount } from "../controllers/userController.js";

const routes = new Hono();


routes.post('/signup', registerAccount);
routes.post('/signin', loginAccount);
routes.get('/signout', logoutAccount);

// bagian data disini
routes.get('/data', getAll);
routes.get('/data/match', getMatch);
routes.post('/data/upload', excelUpload);

export default routes;