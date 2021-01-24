import { dataRequest, deleteMapper, exist, getChildsByParent, isValidPasswordLength, passwordFormat, sendReturn, textFormat } from "../middlewares/index.ts";
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
    const data = await dataRequest(ctx);
}