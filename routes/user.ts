import { dataRequest, deleteMapper, exist, isValidLength, isValidPasswordLength, passwordFormat, sendReturn, textFormat } from "../middlewares/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";//download
import { comparePass } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { config } from '../config/config.ts';
import { getAuthToken, getJwtPayload } from "../helpers/jwt.helpers.ts";
import DateException from "../exceptions/DateException.ts";
import EmailException from "../exceptions/EmailException.ts";
import { Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";
import {sendMail} from "../helpers/mail.ts"
/**
 *  Route login user
 *  @param {RouterContext} ctx 
 */ 
const login = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    // Vérification de si les données sont bien présentes dans le body
    if(data === undefined || data === null) return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    if(data === undefined || data === null || exist(data.Email) == false || exist(data.Password) == false){
        return sendReturn(ctx, 400, { error: true, message: 'Email/password manquants'})
    }else{
        //const user: any = await db.collection('users').findOne({ email: Email.trim().toLowerCase() })
        if(!EmailException.isValidEmail(data.Email) || !passwordFormat(data.Password)){
            return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'});
        }else{
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
                        const jwtToken = await getAuthToken(user, user._id);// génération du token
                        user.token = jwtToken;
                        utilisateur.setId(<{ $oid: string }>user._id);
                        let isSuccess = await utilisateur.update(user);
                        if(isSuccess || isSuccess === 1)
                            return sendReturn(ctx, 200, { error: false, message: "L'utilisateur a été authentifié succès" , user: deleteMapper(user), token: jwtToken})
                        else
                            return sendReturn(ctx, 400, { error: true, message: 'Email/password incorrect'})// Cette erreur ne doit jamais apparaitre
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
}

/**
 *  Route inscription
 *  @param {RouterContext} ctx
 */ 
const register = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    if(data === undefined || data === null || exist(data.email) == false || exist(data.password) == false || exist(data.lastname) == false || exist(data.firstname) == false || exist(data.date_naissance) == false || exist(data.sexe) == false ){
        return sendReturn(ctx, 400, { error: true, message: "Une ou plusieurs données obligatoire sont manquantes"})
    }else{
        if(!EmailException.isValidEmail(data.email) || !DateException.isValidDate(data.date_naissance) || !passwordFormat(data.password) ||
        (data.sexe.toLowerCase() !== "homme" && data.sexe.toLowerCase() !== "femme") || !textFormat(data.firstname) || !textFormat(data.lastname)){
            return sendReturn(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})   
        }else{
            const dbCollection = new UserDB();
            if(await dbCollection.count({email: data.email.trim().toLowerCase()}) !== 0){
                return sendReturn(ctx, 409, { error: true, message: "Un compte utilisant cette adresse mail est déjà enregistré"})  
            }else{
                //insertion dans la base de données 
                let utilisateur = new UserModels(data.email, data.password, data.lastname, data.firstname, data.date_naissance, data.sexe, 0, 0);
                const utilisateurId = await utilisateur.insert();
                const user = await new UserDB().selectUser({ _id: new Bson.ObjectId(utilisateurId) })
                await sendMail(data.email.trim().toLowerCase(), "Welcome!", "Bienvenue sur deno radio feed!")
                return sendReturn(ctx, 201, { error: false, message: "L'utilisateur a bien été créé avec succès", user: deleteMapper(user) })
            }
        }
    }   
}
/**
 *  Route delete user
 *  @param {RouterContext} ctx
 */ 
const deleteUser = async (ctx: RouterContext) => {
    const payloadToken = await getJwtPayload(ctx, ctx.request.headers.get("Authorization"));// Payload du token
    if(payloadToken === null || payloadToken === undefined /*|| payloadToken.role !== 'Tuteur'*/){
        return sendReturn(ctx, 401, { error: true, message: "Votre token n'est pas correct"})
    }else{
        const dbCollection = new UserDB();
        let userParent = await dbCollection.selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
        for(let i = 0; i < userParent.childsTab.length; i++){
            await new UserDB().delete({ _id: userParent.childsTab[i] })
        }
        await dbCollection.delete({ _id: new Bson.ObjectId(payloadToken.id) })
        return sendReturn(ctx, 200, { error: false, message: 'Votre compte et le compte de vos enfants ont été supprimés avec succès' })
    }
}
/**
 *  Route modification
 *  @param {RouterContext} ctx
 */ 
const updateUtil = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);    
    const payloadToken = await getJwtPayload(ctx, ctx.request.headers.get("Authorization"));// Payload du token
    if(payloadToken === null || payloadToken === undefined) 
        {return sendReturn(ctx, 401, { error: true, message: "Votre token n'est pas correct"})
    }else{
        if(data===null||data===undefined){
            return sendReturn(ctx, 200, { error: false, message: "Vos données ont été mises à jour"})
        }else{ 
            const dbCollection = new UserDB();
            let user = await dbCollection.selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
            let toUpdate={firstname:'', lastname:'', dateNaissance:'', sexe:''}
            let isError = false;
            toUpdate.firstname = exist(data.firstname) ? !textFormat(data.firstname) ? (isError = true) : data.firstname : user.firstname;
            toUpdate.lastname = exist(data.lastname) ? !textFormat(data.lastname) ? (isError = true) : data.lastname : user.lastname;
            toUpdate.dateNaissance = exist(data.date_naissance) ? !DateException.isValidDate(data.date_naissance) ? (isError = true) : data.date_naissance : user.dateNaissance;
            toUpdate.sexe = exist(data.sexe) ? (data.sexe.toLowerCase() !== "homme" && data.sexe.toLowerCase() !== "femme") ? (isError = true) : data.sexe : user.sexe;
            if(isError){
                return sendReturn(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronnées"})
            }else{
                let utilisateur = new UserModels(user.email, user.password, user.lastname, user.firstname, user.dateNaissance, user.sexe, user.attempt, user.subscription);
                utilisateur.setId(<{ $oid: string}>user._id)
                utilisateur.update(toUpdate)
                return sendReturn(ctx, 200, { error: false, message: "Vos données ont été mises à jour"}) 
            }  
        }
    }
}

export { login, register, deleteUser, updateUtil};