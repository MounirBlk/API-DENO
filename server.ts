import * as path from "https://deno.land/std@0.65.0/path/mod.ts"//download
import { Application, Router, RouterContext, Request, Response, send } from "https://deno.land/x/oak/mod.ts";//download
import { config } from './config/config.ts';
import { staticFileMiddleware } from "./middlewares/staticFileMiddleware.ts";
import { deleteChild, getChilds, newChild } from "./routes/child.ts";
import { addCard, getBills, subscription } from "./routes/facture.ts";
import { getSong, getSongs } from "./routes/songs.ts";
import { deconnexion, deleteUser, login, register, updateUtil } from "./routes/user.ts";
//import { play } from "https://deno.land/x/audio@0.1.0/mod.ts";//download


const app = new Application();
const router = new Router();

const port = 8000;
app.use(router.routes())
app.use(router.allowedMethods())

app.use(staticFileMiddleware);//1 Send static content index.html and error.html
router.post('/login', login); //2 Route login
router.post('/register', register);//3 Route register
router.put('/subscription', subscription);//4 Route abonnement de l'utilisateur
router.put('/user', updateUtil);//5 update données utilisateur
router.delete('/user/off', deconnexion);//6 Route deconnexion de l'utilisateur 
router.post('/user/child', newChild);//7 Route new child
router.delete('/user/child', deleteChild);//8 Route delete child
router.get('/user/child', getChilds);//9 Route recuperations tous les childs d'un parent
router.put('/user/cart', addCard);//10 Route ajout carte bancaire
router.delete('/user', deleteUser);//11 Route delete user
router.get('/songs', getSongs);//12 Route recuperation des sources audio
router.get('/songs/:id', getSong);//13 Route recuperation d'une source audio
router.get('/bills', getBills);//14 Route recuperation des factures d'un parent

// deno run --allow-net --allow-read --unstable server.ts
// denon run --allow-net --allow-read --unstable server.ts
app.listen({port: port})

console.log(`app listening on -> http://localhost:${port}/`);