import { Hono } from "hono";
import { getMatch } from "../controllers/dptController.js";
import { deleteFile, downloadSample, excelUpload, exportMatchToExcel, getFile, listFileExcel, previewFileExcel } from "../controllers/excelController.js";
import { dataAccount, deleteAccount, listAccount, loginAccount, logoutAccount, registerAccount, updateAccount } from "../controllers/userController.js";
import { activationSubscriptions, createSubscriptions, getRequestLimits, getSubscriptions } from "../controllers/subscriptionsController.js";

const routes = new Hono();


routes.post('/signup', registerAccount);
routes.post('/signin', loginAccount);
routes.get('/signout', logoutAccount);

// bagian data disini kena protect
routes.get('/data/match', getMatch);
routes.get('/data/users', listAccount);
routes.put('/data/user', updateAccount);

routes.get('/data/user', dataAccount);
routes.delete('/data/user', deleteAccount);

// ini untuk export ke excel
routes.get('/data/match/export', exportMatchToExcel);

routes.post('/data/upload', excelUpload);
routes.get('/data/files', getFile);
routes.delete('/data/files', deleteFile);

// bagian data excel ada disini
routes.get('/data/read', previewFileExcel);
routes.get('/data/all', listFileExcel);
routes.get('/data/sample', downloadSample);

// untuk subscriptions
routes.get('/data/subscriptions', getSubscriptions);
routes.post('/data/subscriptions', createSubscriptions);
routes.put('/data/subscriptions', activationSubscriptions);
routes.get('/data/subscriptions/request', getRequestLimits);
export default routes;
