import * as path from "https://deno.land/std@0.65.0/path/mod.ts"//download
import { Application, Router, RouterContext, Request, Response, send } from "https://deno.land/x/oak/mod.ts";//download
import { config } from './config/config.ts';
import { staticFileMiddleware } from "./middlewares/staticFileMiddleware.ts";
import { deleteChild, getChilds, newChild } from "./routes/child.ts";
import { deleteUser, login, register, updateUtil } from "./routes/user.ts";
//import { play } from "https://deno.land/x/audio@0.1.0/mod.ts";


const app = new Application();
const router = new Router();

const port = 8000;
app.use(router.routes())
app.use(router.allowedMethods())

app.use(staticFileMiddleware);//1 Send static content index.html and error.html
router.post('/login', login); //2 Route login
router.post('/register', register);//3 Route register
router.post('/user/child', newChild);//7 Route new child
router.delete('/user/child', deleteChild);//8 Route delete child
router.get('/user/child', getChilds);//9 Route recuperations tous les childs d'un parent
router.put('/user', updateUtil);//5 update données utilisateur
router.delete('/user', deleteUser);//11 Route delete user

// deno run --allow-net --allow-read --unstable server.ts
// denon run --allow-net --allow-read --unstable server.ts
app.listen({port: port})

console.log(`app listening on -> http://localhost:${port}/`);