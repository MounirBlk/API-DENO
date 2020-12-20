import * as path from "https://deno.land/std@0.65.0/path/mod.ts"//download
//import { Application, Router, RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { Application, Context } from "https://deno.land/x/abc@v1.2.2/mod.ts";//download
import { config } from './config/config.ts';
import { login, register } from "./routes/user.ts";

const app = new Application();
const port = 8000;

app.static('/', './public');

app.get("/", async(ctx: Context) => await ctx.file(path.join('./public/index.html')));//Page index.html
app.post('/login', login); //Route login
app.post('/register', register);//Route register

//app.get('*', async(ctx: Context) => await ctx.file(path.join('./public/error.html')));//Page error.html

// deno run --allow-net --allow-read --unstable server.ts
// denon
app.start({port: port})
console.log(`app listening on -> http://localhost:${port}/`);