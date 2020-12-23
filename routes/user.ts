import { deleteUserMapper, exist, sendReturn } from "../middlewares/filter/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { Context } from "https://deno.land/x/abc@v1.2.2/mod.ts";//download
import { comparePass } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";

/**
 *  Route login user
 */ 
const login = async (ctx: Context) => {
    const data: any = await ctx.body;
    
    // Vérification de si les données sont bien présentes dans le body
    if(exist(data.Email) == false || exist(data.Password) == false){
        return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    }else{
        //const dbCollection = db.collection('users');
        //const user: any = await dbCollection.findOne({ email: data.Email.trim().toLowerCase() })
        const dbCollection =  new UserDB();
        const user = await dbCollection.selectUser(data.Email.trim().toLowerCase())
        if (user == undefined || user == null) {
            return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
        }else{
            const isValid = await comparePass(data.Password, user.password); //verification password
            if(isValid){
                if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.email + " (5 max) - Veuillez patienter (2min)"});
                }else{
                    return sendReturn(ctx, 200, { error: false, message: "L'utilisateur a été authentifié succès" , user: deleteUserMapper(user)})
                }
            }else{
                let utilisateur = new UserModels(user.email, user.password, user.lastname, user.firstname, user.dateNaissance, user.sexe, user.attempt, user.subscription);
                if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.email + " (5 max) - Veuillez patienter (2min)"});
                }else if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) >= 2){
                    user.updateAt = new Date();
                    user.attempt = 1;
                    utilisateur.update(user)
                    return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
                }else{
                    user.updateAt = new Date();
                    user.attempt = user.attempt + 1;
                    return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
                }
            }
        }
    }
}

/**
 *  Route inscription
 */ 
const register = async (ctx: Context) => {
    const data: any = await ctx.body;
    // Vérification de si les données sont bien présentes dans le body
    let error: boolean = false
    let user = new UserModels('kjkj@toto.com','kjkj','kjkj','kjkj',"1993-11-22",'Homme',0 ,0);
    user.insert()
    return sendReturn(ctx, 200, { error: false, message: user})
}

export { login, register};