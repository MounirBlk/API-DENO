import { exist, sendReturn } from "../middlewares/filter/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { Context } from "https://deno.land/x/abc@v1.2.2/mod.ts";//download

/**
 *  Route login user
 */ 
const login = async (ctx: Context) => {
    const data: any = await ctx.body;
    // Vérification de si les données sont bien présentes dans le body
    if(exist(data.Email) == false || exist(data.Password) == false){
        sendReturn(ctx, 400, { error: false, message: 'Email/password manquants'})
    }else{
        return sendReturn(ctx, 200, { error: false, message: data})
    }
}

/**
 *  Route inscription (TO DO)
 */ 
const register = async (ctx: Context) => {
    const data: any = await ctx.body;
    // Vérification de si les données sont bien présentes dans le body
    let error: boolean = false
    let user = new UserModels('kjkj@toto.com','kjkj','kjkj','kjkj',"1993-11-22",'Homme', 0);
    user.insert()
}

export { login, register};