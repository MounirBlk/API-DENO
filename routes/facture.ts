import { dataRequest, deleteMapper, exist, getChildsByParent, isValidPasswordLength, passwordFormat, dataResponse, textFormat, getCurrentDate, randomFloat, floatFormat, calculHtToTtc, calculTtcToHt, isValidLength } from "../middlewares/index.ts";
import { UserModels } from "../Models/UserModels.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { UserDB } from "../db/userDB.ts";
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { config } from '../config/config.ts';
import { getAuthToken, getJwtPayload } from "../helpers/jwt.helpers.ts";
import { Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";
import { FactureDB } from "../db/FactureDB.ts";
import { FactureModels } from "../Models/FactureModels.ts";
import FactureInterfaces from "../interfaces/FactureInterfaces.ts";
import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";
import type { float, DateString } from 'https://deno.land/x/etype/mod.ts';

/**
 *  Route subscription
 *  @param {RouterContext} ctx
 */ 
export const subscription = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    //await addBill(payloadToken.id) // ajout facture
}

/**
 *  Route addCard
 *  @param {RouterContext} ctx
 */ 
export const addCard = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    if(data === undefined || data === null) return dataResponse(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})
    if(exist(data.cartNumber) === false || exist(data.month) === false || exist(data.year) === false || exist(data.default) === false) return dataResponse(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})
    const payloadToken = await getJwtPayload(ctx, ctx.request.headers.get("Authorization"));// Payload du token
    if(payloadToken === null || payloadToken === undefined){
        return dataResponse(ctx, 401, { error: true, message: "Votre token n'est pas correct"})
    } else{
        let isError = false
        if(isError){
            return dataResponse(ctx, 402, { error: true, message: "Informations bancaire incorrectes"})
        }else{
            if(isError){
                return dataResponse(ctx, 409, { error: true, message: "La carte existe déjà"})
            }else{
                if(isError){
                    return dataResponse(ctx, 403, { error: true, message: "Veuillez compléter votre profil avec une carte de crédit"})
                }else{
                    const userParent = await new UserDB().selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
                    if(userParent.role !== 'Tuteur'){
                        return dataResponse(ctx, 403, { error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"})
                    }else{
                        data.default = data.default ? true : false;// convert true type string with true type boolean
                        if(!isValidLength(data.cartNumber, 16, 16) || !isValidLength(data.month, 2, 2) || !isValidLength(data.year, 2, 2) || (data.default !== true && data.default !== false)){
                            return dataResponse(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})
                        }else{
                            const cardInfos = {
                                id_carte: await new UserDB().getUniqId(),
                                cartNumber: data.cartNumber,
                                month: data.month,
                                year: data.year,
                                default: data.default
                            }
                            let utilisateur = new UserModels(userParent.email, userParent.password, userParent.lastname, userParent.firstname, userParent.dateNaissance, userParent.sexe, userParent.attempt, userParent.subscription);
                            utilisateur.setId(<{ $oid: string }>userParent._id)
                            await utilisateur.update({ cardInfos: cardInfos })
                            return dataResponse(ctx, 200, { error: false, message: "Vos données ont été mises à jour"})
                        }
                    }
                }
            }
        }
    }

}

/**
 *  Route getBills
 *  @param {RouterContext} ctx
 */ 
export const getBills = async (ctx: RouterContext) => {
    const payloadToken = await getJwtPayload(ctx, ctx.request.headers.get("Authorization"));// Payload du token
    //if (payloadToken === false) return dataResponse(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})//error taille du token invalide
    if (payloadToken === null || payloadToken === undefined ) return dataResponse(ctx, 401, { error: true, message: "Votre token n'est pas correct"})
    const dbCollection = new UserDB();
    const userParent = await dbCollection.selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
    if (userParent.role !== 'Tuteur') return dataResponse(ctx, 403, { error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"})
    //await addBill(payloadToken.id) // ajout facture
    const factures = await new FactureDB().selectAllFactures({ idUser : payloadToken.id });
    return dataResponse(ctx, 200, { error: false, bill: factures.map((item: FactureInterfaces) => deleteMapper(item, 'getBills'))})
}

/**
 *  addBill
 *  @param {string} idUser
 */ 
const addBill = async (idUser: string) => {
    console.log(idUser)
    let tauxTva = 0.2;
    let montant_ttc = randomFloat(100,1000);
    const factures = new FactureModels(v4.generate(), getCurrentDate(), parseFloat(calculTtcToHt(montant_ttc, tauxTva).toFixed(2)), parseFloat(montant_ttc.toFixed(2)), idUser)
    await factures.insert()
}