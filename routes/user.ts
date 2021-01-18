import { dataRequest, deleteMapper, exist, isValidPassword, sendReturn, textFormat } from "../middlewares/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";//download
import { comparePass } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { config } from '../config/config.ts';
import { getAuthToken } from "../helpers/jwt.helpers.ts";
import DateException from "../exceptions/DateException.ts";
import EmailException from "../exceptions/EmailException.ts";
import { Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";

/**
 *  Route login user
 *  @param {RouterContext} ctx 
 */ 
const login = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    // Vérification de si les données sont bien présentes dans le body
    //if(data === undefined || data === null) return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    if(data === undefined || data === null || exist(data.Email) == false || exist(data.Password) == false){
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
    const data = await dataRequest(ctx);
    if(data === undefined || data === null || exist(data.email) == false || exist(data.password) == false || exist(data.lastname) == false || exist(data.firstname) == false || exist(data.date_naissance) == false|| exist(data.sexe) == false ){
        return sendReturn(ctx, 400, { error: true, message: "Une ou plusieurs données obligatoire sont manquantes"})
    }else{
        if(!EmailException.isValidEmail(data.email) || !DateException.isValidDate(data.date_naissance) || !isValidPassword(data.password) ||
        (data.sexe.toLowerCase() !== "homme" && data.sexe.toLowerCase() !== "femme") || !textFormat(data.firstname) || !textFormat(data.lastname)){
            return sendReturn(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})   
        }else{
            const dbCollection = new UserDB();
            if(await dbCollection.count({email: data.email.trim().toLowerCase()}) !== 0){
                return sendReturn(ctx, 409, { error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré"})  
            }else{
                if(!EmailException.isValidEmail(data.email) || !isValidPassword(data.password)){
                    return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'}) //cette erreur n'apparaitra jamais
                }else{ 
                    //insertion dans la base de données 
                    let utilisateur = new UserModels(data.email, data.password, data.lastname, data.firstname, data.date_naissance, data.sexe, 0, 0);
                    const utilisateurId = await utilisateur.insert();
                    const user = await new UserDB().selectUser({ _id: new Bson.ObjectId(utilisateurId) })
                    return sendReturn(ctx, 201, { error: false, message: "L'utilisateur a bien été créé avec succès", user: deleteMapper(user, 'register')})   
                }
            }
        }
    }   
}

export { login, register};