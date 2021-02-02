import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";
import { exist } from "../middlewares/index.ts";
import { config } from '../config/config.ts';
//import "https://deno.land/x/dotenv/load.ts"; download (--allow-env)
//import { getRandomFilename } from "https://deno.land/x/oak@v6.4.1/util.ts";

const {
  SEND_EMAIL,
  SEND_PWD
} = config;

export const sendMail = async (email:string, objet: string = "Welcome!", content: string = "Bienvenue sur deno radio feed!" ): Promise <void> => { 
  const client = new SmtpClient(); 

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,// 25  465  587
      username: SEND_EMAIL,
      password: SEND_PWD,
    });

    await client.send({
      from: exist(SEND_EMAIL) ? SEND_EMAIL : "ne-pas-repondre-deno@gmail.com",
      to: email,
      subject: objet,
      content: content,
    });

    await client.close();
}