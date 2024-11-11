import { Hono } from "hono";
import { getMatch } from "../controllers/dptController.js";
import { downloadSample, excelUpload, exportMatchToExcel, getFile, listFileExcel, previewFileExcel } from "../controllers/excelController.js";
import { loginAccount, logoutAccount, registerAccount } from "../controllers/userController.js";

const routes = new Hono();


routes.post('/signup', registerAccount);
routes.post('/signin', loginAccount);
routes.get('/signout', logoutAccount);

// bagian data disini kena protect
//routes.get('/data', getAll);
routes.get('/data/match', getMatch);

// ini untuk export ke excel
routes.get('/data/match/export', exportMatchToExcel);
routes.post('/data/upload', excelUpload);
routes.get('/data/files', getFile);

// bagian data excel ada disini
routes.get('/data/read', previewFileExcel);
routes.get('/data/all', listFileExcel);
routes.get('/data/sample', downloadSample);

export default routes;