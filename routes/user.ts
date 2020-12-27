import { dataRequest, deleteUserMapper, exist, sendReturn } from "../middlewares/filter/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";//download
import { comparePass } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { config } from '../config/config.ts';

/**
 *  Route login user
 */ 
const login = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    // Vérification de si les données sont bien présentes dans le body
    if(exist(data.Email) == false || exist(data.Password) == false){
        return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    }else{
        //const dbCollection = db.collection('users');
        //const user: any = await dbCollection.findOne({ email: Email.trim().toLowerCase() })
        const dbCollection =  new UserDB();
        const user = await dbCollection.selectUser(data.Email.trim().toLowerCase())
        if (user == undefined || user == null) {
            return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
        }else{
            const isValid = await comparePass(data.Password, user.password); //verification password
            let utilisateur = new UserModels(user.email, user.password, user.lastname, user.firstname, user.dateNaissance, user.sexe, user.attempt, user.subscription);
            if(isValid){
                if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.Email + " (5 max) - Veuillez patienter (2min)"});
                }else{
                    const jwtToken = await create({ alg: "HS512", typ: "JWT" }, { exp: getNumericDate(parseInt(config.JWT_ACCESS_TOKEN_EXP)) , id: user._id }, config.JWT_TOKEN_SECRET)
                    user.token = jwtToken;
                    utilisateur.setId(<{ $oid: string }>user._id);
                    let isSuccess = utilisateur.update(user);
                    if(isSuccess || isSuccess === 1)
                        return sendReturn(ctx, 200, { error: false, message: "L'utilisateur a été authentifié succès" , user: deleteUserMapper(user)})
                    else
                        return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                }
            }else{
                if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) <= 2){
                    return sendReturn(ctx, 429, { error: true, message: "Trop de tentative sur l'email " + data.Email + " (5 max) - Veuillez patienter (2min)"});
                }else if(user.attempt >= 5 && ((<any>new Date() - <any>user.updateAt) / 1000 / 60) >= 2){
                    user.updateAt = new Date();
                    user.attempt = 1;
                    utilisateur.setId(<{ $oid: string }>user._id);
                    let isSuccess = utilisateur.update(user);
                    if(isSuccess || isSuccess === 1)
                        return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})
                    else
                        return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                }else{
                    user.updateAt = new Date();
                    user.attempt = user.attempt + 1;
                    utilisateur.setId(<{ $oid: string }>user._id);
                    let isSuccess = utilisateur.update(user);
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
    // Vérification de si les données sont bien présentes dans le body
    let error: boolean = false;
    let user = new UserModels('kjkj@toto.com','kjkj','kjkj','kjkj',"1993-11-22",'Homme',0 ,0);
    user.insert()
    return sendReturn(ctx, 200, { error: false, message: user})
}

export { login, register};