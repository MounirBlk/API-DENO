import { dataRequest, deleteMapper, exist, getChildsByParent, isValidPasswordLength, passwordFormat, dataResponse, textFormat, getCurrentDate, randomFloat, floatFormat, calculHtToTtc, calculTtcToHt, isValidLength, updateSubscriptionChilds } from "../middlewares/index.ts";
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
import { sendMail } from "../helpers/mail.ts";
import { addCardStripe, addCustomerStripe, updateCustomerCardStripe, paymentStripe } from "../middlewares/stripe.ts";
import { ProductDB } from "../db/ProductDB.ts";

/**
 *  Route subscription
 *  @param {RouterContext} ctx
 */ 
export const subscription = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
    if(data === undefined || data === null) return dataResponse(ctx, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes'})
    if(exist(data.id) === false || exist(data.cvc) === false) {
        return dataResponse(ctx, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes'})
    }else{
        const payloadToken = await getJwtPayload(ctx, ctx.request.headers.get("Authorization"));// Payload du token
        if (payloadToken === null || payloadToken === undefined ) return dataResponse(ctx, 401, { error: true, message: "Votre token n'est pas correct"})
        const userParent = await new UserDB().selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
        if (userParent.role !== 'Tuteur') return dataResponse(ctx, 403, { error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"})
        //let isError = false;
        if(!isValidLength(data.cvc, 3, 3) || !isValidLength(data.id, 1, 10) || userParent.cardInfos?.id_carte !== parseInt(data.id)){
            return dataResponse(ctx, 402, { error: true, message: "Echec du payement de l'offre"})
        }else{
            if(((<any>new Date() - <any>userParent.dateSouscription) / 1000 / 60) <= 5 || userParent.dateSouscription === null){// periode d'essaie
                let utilisateurParent = new UserModels(userParent.email, userParent.password, userParent.lastname, userParent.firstname, userParent.dateNaissance, userParent.sexe, userParent.attempt, userParent.subscription);
                utilisateurParent.setId(<{ $oid: string }>userParent._id)
                if(userParent.dateSouscription === null) await utilisateurParent.update({ subscription: 1, dateSouscription: new Date() });// effectue l'abonnement
                await updateSubscriptionChilds(userParent);
                if(userParent.subscription === 0){
                    setTimeout(async() => {
                        await sendMail(userParent.email.trim().toLowerCase(), "Abonnement radio feed", "Votre abonnement a bien été mise à jour") //port 425 already in use
                        const product = await new ProductDB().selectProduct({ name : "Radio-FEED" })
                        const responsePayment = await paymentStripe(userParent.customerId, product.idProduct); //responseAddProduct.data.id est l'id price du produit
                        await addBill(responsePayment?.data.id, payloadToken.id) // ajout facture
                    }, 60000 * 5);//5 mins asynchrone
                }
                return dataResponse(ctx, 200, { error: false, message: "Votre période d'essai viens d'être activé - 5min" })
            }else{// abonnement 
                /*if(await new FactureDB().count({ idUser: payloadToken.id}) === 0){// abonnement deja présent
                    await sendMail(userParent.email.trim().toLowerCase(), "Abonnement radio feed", "Votre abonnement a bien été mise à jour") //port 425 already in use
                    const product = await new ProductDB().selectProduct({name : "Radio-FEED"})
                    const responsePayment = await paymentStripe(userParent.customerId, product.idProduct); //responseAddProduct.data.id est l'id price du produit
                    await addBill(responsePayment?.data.id, payloadToken.id) // ajout facture
                }*/
                return dataResponse(ctx, 200, { error: false, message: "Votre abonnement a bien été mise à jour" })
            }
        }
    }
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
                            const responseAddCard = await addCardStripe(cardInfos.cartNumber, cardInfos.month, cardInfos.year); //4242424242424242, 11, 22, 123
                            const responseAddCustomer = await addCustomerStripe(userParent.email, userParent.firstname + ' ' + userParent.lastname);
                            await updateCustomerCardStripe(responseAddCustomer.data.id, responseAddCard.data.id);
                            let utilisateur = new UserModels(userParent.email, userParent.password, userParent.lastname, userParent.firstname, userParent.dateNaissance, userParent.sexe, userParent.attempt, userParent.subscription);
                            utilisateur.setId(<{ $oid: string }>userParent._id)
                            await utilisateur.update({ cardInfos: cardInfos, customerId : responseAddCustomer.data.id})
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
 *  @param {string} idStripePayment
 *  @param {string} idUser
 */ 
const addBill = async (idStripePayment: string, idUser: string) => {
    let tauxTva = 0.2;
    let montant_ttc = 5/*randomFloat(100,1000)*/; //5 Euros
    const idStripe = idStripePayment === null || idStripePayment === undefined ? v4.generate() : idStripePayment
    const factures = new FactureModels(idStripe, getCurrentDate(), parseFloat(calculTtcToHt(montant_ttc, tauxTva).toFixed(2)), parseFloat(montant_ttc.toFixed(2)), idUser)
    await factures.insert()
}