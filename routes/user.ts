import { dataRequest, deleteMapper, exist, sendReturn } from "../middlewares/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";//download
import { comparePass } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { config } from '../config/config.ts';
import { getAuthToken } from "../helpers/jwt.helpers.ts";

/**
 *  Route login user
 *  @param {RouterContext} ctx 
 */ 
const login = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    // Vérification de si les données sont bien présentes dans le body
    if(data === undefined || data === null) return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    if(exist(data.Email) == false || exist(data.Password) == false){
        return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    }else{
        //const user: any = await db.collection('users').findOne({ email: Email.trim().toLowerCase() })
        const dbCollection =  new UserDB();
        const user = await dbCollection.selectUser({email : data.Email.trim().toLowerCase()})
        if (user == undefined || user == null) {
            return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
        }else{
            const isValid = await comparePass(data.Password, user.password); //verification password
            let utilisateur = new UserModels(user.email, user.password, user.lastname, user.firstname, user.dateNaissance, user.sexe, user.attempt, user.subscription);
            if(isValid){ // true
                if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.Email + " (5 max) - Veuillez patienter (2min)"});
                }else{
                    const jwtToken = await getAuthToken(user, user._id);
                    user.token = jwtToken;
                    utilisateur.setId(<{ $oid: string }>user._id);
                    let isSuccess = await utilisateur.update(user);
                    if(isSuccess || isSuccess === 1)
                        return sendReturn(ctx, 200, { error: false, message: "L'utilisateur a été authentifié succès" , user: deleteMapper(user, 'login'), token: jwtToken})
                    else
                        return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                }
            }else{ // false
                if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.Email + " (5 max) - Veuillez patienter (2min)"});
                }else if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) >= 2){
                    user.updateAt = new Date();
                    user.attempt = 1;
                    utilisateur.setId(<{ $oid: string }>user._id);
                    let isSuccess = await utilisateur.update(user);
                    if(isSuccess || isSuccess === 1)
                        return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
                    else
                        return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                }else{
                    user.updateAt = new Date();
                    user.attempt = user.attempt + 1;
                    utilisateur.setId(<{ $oid: string }>user._id);
                    let isSuccess = await utilisateur.update(user);
                    if(isSuccess || isSuccess === 1)
                        return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
                    else
                        return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                }
            }
        }
    }
}

/**
 *  Route inscription
 */ 
        const register = async (ctx: RouterContext) => {
            const data = await dataRequest(ctx)
            // const dbCollection =  new UserDB();
            // const user = await dbCollection.selectUser()
            // if (user == data.email){ 
            //     return sendReturn(ctx, 400, { error: true, message: 'adresse mail exist déjà'}) 
            // }

          if(exist(data.email) == false || exist(data.Password) == false || exist(data.lastname) == false || exist(data.firstname) == false || exist(data.dateNaissance) == false|| exist(data.sexe) == false ){
                return sendReturn(ctx, 400, { error: true, message: 'champ manquant'})
            }else{
                //insertion dans la base de données 
                let utilisateur = new UserModels(data.email, data.password, data.lastname, data.firstname, data.dateNaissance, data.sexe, data.attempt, data.subscription);
                await utilisateur.insert();
                console.log(utilisateur);
            }
     
 }

export { login, register};