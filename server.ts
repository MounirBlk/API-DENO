import * as expressive from "https://raw.githubusercontent.com/NMathar/deno-express/master/mod.ts";
import { config } from './config/config.ts';
import { UserModels } from './Models/UserModels.ts';

const port = 8001;
const app = new expressive.App();
// route with dynamic parameter
app.get("/", async(req, res) => {
    await res.json([
        { id: 2, name: "Jim Doe", phone: "12425323" },
    ]);
});

let user = new UserModels('kjkj','kjkj','kjkj','kjkj','kjkj',"1993-11-22", 1);
user.insert()
console.log(user);


const server = await app.listen(port);
// deno run --allow-net --allow-read --unstable server.ts
console.log("app listening on port " + server.port);