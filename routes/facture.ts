import { dataRequest, deleteMapper, exist, getChildsByParent, isValidPasswordLength, passwordFormat, dataResponse, textFormat, getCurrentDate, randomFloat, floatFormat, calculHtToTtc, calculTtcToHt, isValidLength, updateSubscriptionChilds, numberFormat, isValidDateCard } from "../middlewares/index.ts";
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
import { addCardStripe, addCustomerStripe, updateCustomerCardStripe, paymentStripe, checkIsCardAlreadyExist, checkIsFailPayment } from "../middlewares/stripe.ts";
import { ProductDB } from "../db/ProductDB.ts";
import { cardTypes } from "../types/cardTypes.ts";

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
        const userParent: UserInterfaces = await new UserDB().selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
        if(await checkIsFailPayment(userParent, data)){// true = fail payement et false = success payement
            return dataResponse(ctx, 402, { error: true, message: "Echec du payement de l'offre"})
        }else{
            if (userParent.role !== 'Tuteur') return dataResponse(ctx, 403, { error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"})
            if(((<any>new Date() - <any>userParent.dateSouscription) / 1000 / 60) <= 5 || userParent.dateSouscription === null){// periode d'essaie activé
                if(<number>userParent.subscription === 0){
                    let utilisateurParent = new UserModels(userParent.email, userParent.password, userParent.lastname, userParent.firstname, userParent.dateNaissance, userParent.sexe, userParent.attempt, userParent.subscription);
                    utilisateurParent.setId(<{ $oid: string }>userParent._id);
                    if(userParent.dateSouscription === null) await utilisateurParent.update({ subscription: 1, dateSouscription: new Date() });// effectue l'abonnement
                    await updateSubscriptionChilds(userParent);
                    setTimeout(async() => {
                        await abonnementDetails(userParent, payloadToken)
                    }, 60000 * 5);//5 mins asynchrone
                }else{
                    //let todayWith5mins = new Date(new Date().getTime() + 5*60000); //Date dans le futur de 5mins
                    setTimeout(async() => {
                        await abonnementDetails(userParent, payloadToken)
                    }, ((<any>userParent.dateSouscription / 1) + 10000) - (new Date().getTime()));//Temps restant pour la période d'essaie (new Date().getTime() est équivalent <any>new Date() / 1)
                }
                return dataResponse(ctx, 200, { error: false, message: "Votre période d'essai viens d'être activé - 5min" });
            }else{// abonnement confirmé
                if(await new FactureDB().count({ idUser : String(payloadToken.id) }) === 0){//Condition optionnel au cas où l'utilisateur ne recoit pas "son mail / son stripe payement / sa facture" 5 mins apres le lancement de la subscription
                        await abonnementDetails(userParent, payloadToken);
                }
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
        const userParent: UserInterfaces = await new UserDB().selectUser({ _id: new Bson.ObjectId(payloadToken.id) })
        let isError = false
        if(isError){
            return dataResponse(ctx, 402, { error: true, message: "Informations bancaire incorrectes"});//incoherence ordre
        }else{
            if(await checkIsCardAlreadyExist(userParent, data)){//true = card exist deja
                return dataResponse(ctx, 409, { error: true, message: "La carte existe déjà"})
            }else{
                if(userParent.role !== 'Tuteur'){
                    return dataResponse(ctx, 403, { error: true, message: "Vos droits d'accès ne permettent pas d'accéder à la ressource"})
                }else{
                    //data.default = data.default ? true : false;// convert true type string with true type boolean
                    data.month = parseInt(data.month) > 0 && parseInt(data.month) < 10 ? '0'.concat(String(parseInt(data.month))) : data.month
                    const isNegative: boolean =  parseInt(data.cartNumber) < 0 || parseInt(data.month) < 0 || parseInt(data.year) < 0 ? true : false;// verif negative number
                    const isInvalidFormat: boolean = !numberFormat(data.cartNumber) || !numberFormat(data.month) || !numberFormat(data.year) || (data.default !== 'true' && data.default !== 'false')  ? true : false ;// verif conformité datas
                    const isDataInvalidLength: boolean = !isValidLength(data.cartNumber, 16, 16) || !isValidLength(data.month, 2, 2) || !isValidLength(data.year, 2, 2) ? true : false;// verif taille datas
                    if(isNegative || isInvalidFormat || isDataInvalidLength || isValidDateCard(data) === false){
                        return dataResponse(ctx, 409, { error: true, message: "Une ou plusieurs données sont erronées"})
                    }else{
                        const customerId = (userParent.customerId === null || userParent.customerId === undefined) ? (await addCustomerStripe(userParent.email, userParent.firstname + ' ' + userParent.lastname)).data.id : userParent.customerId;
                        const respCardRequest = await addCardStripe(data.cartNumber, data.month, data.year);
                        if(respCardRequest.status === 402 && respCardRequest.data.error){
                            return dataResponse(ctx, 402, { error: true, message: "Informations bancaire incorrectes"});//Le numéro de la carte est invalide
                        }else{
                            await updateCustomerCardStripe(customerId, respCardRequest.id);
                            let cardList: Array<cardTypes> | undefined = []
                            cardList = userParent.cardInfos;
                            const cardInfos = {
                                id_carte: await new UserDB().getUniqId(),
                                cartNumber: data.cartNumber,
                                month: data.month,
                                year: data.year,
                                default: data.default,
                                cardIdStripe: respCardRequest.card.id
                            }
                            cardList?.push(cardInfos)
                            let utilisateur = new UserModels(userParent.email, userParent.password, userParent.lastname, userParent.firstname, userParent.dateNaissance, userParent.sexe, userParent.attempt, userParent.subscription);
                            utilisateur.setId(<{ $oid: string }>userParent._id)
                            await utilisateur.update({ cardInfos: cardList, customerId : customerId})
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
const addBill = async (idStripePayment: string, idUser: string): Promise<void> => {
    let tauxTva = 0.2;
    let montant_ttc = 5/*randomFloat(100,1000)*/; //5 Euros
    const idStripe = idStripePayment === null || idStripePayment === undefined ? v4.generate() : idStripePayment
    const factures = new FactureModels(idStripe, getCurrentDate(), parseFloat(calculTtcToHt(montant_ttc, tauxTva).toFixed(2)), parseFloat(montant_ttc.toFixed(2)), idUser)
    await factures.insert()
}

/**
 *  Abonnement details: send mail / add bill / add abonnement stripe
 *  @param {UserInterfaces} userParent
 *  @param {Object} payloadToken
 */
const abonnementDetails = async(userParent: UserInterfaces, payloadToken: any): Promise<void> => {
    if(await new FactureDB().count({ idUser : String(payloadToken.id) }) === 0){//Condition optionnel au cas où l'utilisateur ne recoit pas "son mail / son stripe payement / sa facture" 5 mins apres le lancement de la subscription
        await sendMail(userParent.email.trim().toLowerCase(), "Abonnement radio feed", "Votre abonnement a bien été mise à jour"); //port 425 already in use
        const product = await new ProductDB().selectProduct({ name : "Radio-FEED" });
        const responsePayment = await paymentStripe(userParent.customerId, product.idProduct); //responseAddProduct.data.id est l'id price du produit
        await addBill(responsePayment?.data.id, payloadToken.id); // ajout facture
    }
}