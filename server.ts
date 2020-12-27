import * as path from "https://deno.land/std@0.65.0/path/mod.ts"//download
import { Application, Router, RouterContext, Request, Response, send } from "https://deno.land/x/oak/mod.ts";//download
import { config } from './config/config.ts';
import { login, register } from "./routes/user.ts";

const app = new Application();
const router = new Router();

const port = 8000;
app.use(router.routes())
app.use(router.allowedMethods())

// Send static content
app.use(async (context) => {
    await context.send({
        root: `${Deno.cwd()}/public`,
        index: "index.html",
    });
});

//router.get("/", async(ctx: RouterContext) => console.log(true) );//Page index.html
router.post('/login', login); //Route login
router.post('/register', register);//Route register
//router.get('*', async(ctx: RouterContext) => console.log(true));//Page error.html

// deno run --allow-net --allow-read --unstable server.ts
// denon

app.listen({port: port})
console.log(`app listening on -> http://localhost:${port}/`);