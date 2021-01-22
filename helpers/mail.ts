import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";
import "https://deno.land/x/dotenv/load.ts";
import {exist} from "../middlewares/index.ts";
import { getRandomFilename } from "https://deno.land/x/oak@v6.4.1/util.ts";


const sendMail = async (email:string): Promise <void>=>{ 
const client = new SmtpClient(); 
  await client.connectTLS({
    hostname: "smtp.gmail.com",
    port: 465,
    username: Deno.env.get("SEND_EMAIL"),
    password: Deno.env.get("SEND_PWD") ,
  });
  await client.send({
    from: exist(<string>Deno.env.get("SEND_EMAIL")) ? <string>Deno.env.get("SEND_EMAIL"): "exemple@gmail.com",
    to: email,
    subject: "Welcome!",
    content: "Hi from Vuelancer!",
  });
  await client.close();
}

sendMail('email@test.com');