import { dataRequest, deleteMapper, exist, isValidPassword, sendReturn, textFormat } from "../middlewares/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";//download
import { comparePass, hash } from "../helpers/password.helpers.ts";
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { config } from '../config/config.ts';
import { getAuthToken, getJwtPayload } from "../helpers/jwt.helpers.ts";
import EmailException from "../exceptions/EmailException.ts";
import DateException from "../exceptions/DateException.ts";

/**
 *  Route new child
 *  @param {RouterContext} ctx 
 */ 
const newChild = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    const payloadToken = await getJwtPayload(ctx, ctx.request.headers.get("Authorization"));// Payload du token
    if (payloadToken === null || payloadToken === undefined || payloadToken.role.toLowerCase() !== 'tuteur') return sendReturn(ctx, 403, { error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"})
    // Vérification de si les données sont bien présentes dans le body
    let error: boolean = false;
    if(data === undefined || data === null) return sendReturn(ctx, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes'})
    if(exist(data.firstname) === false || exist(data.lastname) === false || exist(data.email) === false) error = true;
    if(exist(data.password) === false || exist(data.date_naissance) === false || exist(data.sexe) === false) error = true;
    if(error){
        return sendReturn(ctx, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes'})
    }else{
        if(!EmailException.isValidEmail(data.email) || !DateException.isValidDate(data.date_naissance) || !isValidPassword(data.password) ||
        (data.sexe !== "Homme" && data.sexe !== "Femme") || !textFormat(data.firstname) || !textFormat(data.lastname)){
            return sendReturn(ctx, 409, { error: true, message: 'Une ou plusieurs données sont erronées'})
        }else{
            const dbCollectionTestEmail = new UserDB();
            if(await dbCollectionTestEmail.selectUser(data.email.trim().toLowerCase()) !== undefined){            
                return sendReturn(ctx, 409, { error: true, message: 'Un compte utilisant cette adresse mail est déjà enregistré'})
            }else{
                const dbCollection = new UserDB();
                let userParent = await dbCollection.selectUser(payloadToken.email.trim().toLowerCase())
                let tabChilds: Array<any> = []
                tabChilds = userParent.idChildsTab;
                if (tabChilds.length >= 3){
                    return sendReturn(ctx, 409, { error: true, message: 'Vous avez dépassé le cota de trois enfants'})  
                }else{
                    let utilisateurChild = new UserModels(data.email, data.password, data.lastname, data.firstname, data.date_naissance, data.sexe, 0, 1);
                    utilisateurChild.setRole('enfant')
                    const idChild = await utilisateurChild.insert();
                    let utilisateurParent = new UserModels(userParent.email, userParent.password, userParent.lastname, userParent.firstname, userParent.dateNaissance, userParent.sexe, userParent.attempt, userParent.subscription);
                    tabChilds.push(idChild)
                    utilisateurParent.setId(<{ $oid: string }>userParent._id)
                    let isValid = await utilisateurParent.update({idChildsTab: tabChilds})
                    if (!isValid || isValid === 0){
                        return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                    }else{
                        let isSuccess = await utilisateurChild.update({token: await getAuthToken(utilisateurChild)})
                        if(isSuccess || isSuccess === 1){
                            return sendReturn(ctx, 200, { error: false, message: "Votre enfant a bien été créé avec succès", user: deleteMapper(utilisateurChild, 'newChild')})//Mapper to perform pour l'ordre du role
                        }else{
                            return sendReturn(ctx, 500, { error: true, message: 'Error process'})// Cette erreur ne doit jamais apparaitre
                        }
                    } 
                }               
            }
        }
    }
}

export { newChild };