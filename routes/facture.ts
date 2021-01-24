import { dataRequest, deleteMapper, exist, getChildsByParent, isValidPasswordLength, passwordFormat, dataResponse, textFormat } from "../middlewares/index.ts";
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
import { Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";
import { FactureDB } from "../db/FactureDB.ts";
import { FactureModels } from "../Models/FactureModels.ts";
import FactureInterfaces from "../interfaces/FactureInterfaces.ts";
import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";

/**
 *  Route subscription
 *  @param {RouterContext} ctx
 */ 
export const subscription = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
}

/**
 *  Route addCard
 *  @param {RouterContext} ctx
 */ 
export const addCard = async (ctx: RouterContext) => {
    const data = await dataRequest(ctx);
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
    await addBill(payloadToken.id) // ajout facture
    const factures = await new FactureDB().selectAllFactures({ idUser : payloadToken.id });
    return dataResponse(ctx, 200, { error: false, bill: factures.map((item: FactureInterfaces) => deleteMapper(item, 'getBills'))})
}

/**
 *  addBill
 *  @param {any} id
 */ 
const addBill = async (id: any) => {
    const factures = new FactureModels('erjf22df','2022-05-17 17:52:21', 15.44, 25.25, id)
    await factures.insert()
}