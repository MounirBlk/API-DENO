import { exist, sendReturn } from "../middlewares/filter/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { Context } from "https://deno.land/x/abc@v1.2.2/mod.ts";//download
import { db } from "../db/db.ts";
import { comparePass } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";

/**
 *  Route login user
 */ 
const login = async (ctx: Context) => {
    const data: any = await ctx.body;
    
    // Vérification de si les données sont bien présentes dans le body
    if(exist(data.Email) == false || exist(data.Password) == false){
        return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    }else{
        const dbCollection = db.collection('users');
        const user: any = await dbCollection.findOne({ email: data.Email.trim().toLowerCase() })
        //const userCollection =  new UserDB;
        //const user = userCollection.getUser(data.Email.trim().toLowerCase())
        if (user == undefined || user == null) {
            return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
        }else{
            let utilisateur = new UserModels(user.email, user.password, user.nom, user.prenom, user.dateNaisance, user.sexe, user.attempt, user.subscription);
            const isValid = await comparePass(data.Password, user.password); //verification password
            if(isValid){
                if(user.attempt >= 5 && ((<any>new Date() - user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.email + " (5 max) - Veuillez patienter (2min)"});
                }else{
                    delete user._id;
                    delete user.password;
                    delete user.attempt;
                    return sendReturn(ctx, 200, { error: false, message: "L'utilisateur a été authentifié succès" , user: user})
                }
            }else{
                if(user.attempt >= 5 && ((<any>new Date() - user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.email + " (5 max) - Veuillez patienter (2min)"});
                }else if(user.attempt >= 5 && ((<any>new Date() - user.updateAt) / 1000 / 60) >= 2){
                    user.updateAt = new Date();
                    user.attempt = 1;
                    utilisateur.update(user)
                    return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
                }else{
                    user.updateAt = new Date();
                    user.attempt = user.attempt + 1;
                    utilisateur.update(user)
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