import { create, verify, decode, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";
import { config } from '../config/config.ts';
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { sendReturn } from "../middlewares/index.ts";

const {
    JWT_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXP,
    JWT_REFRESH_TOKEN_EXP,
} = config;

const header: any = {
    alg: "HS256",
    typ: "JWT",
};

/**
 * Function qui fait un retourne un token
 * @param {UserInterfaces} user 
 */
const getAuthToken = async (user: any): Promise < string >  => {
    const payload: any = {
        iss: "deno-imie-api",
        id: user.id,
        email: user.email,
        role: user.role,
        exp: getNumericDate(new Date().getTime() + parseInt(JWT_ACCESS_TOKEN_EXP)),
    };

    return await create(header, payload, JWT_TOKEN_SECRET);
};

/**
 * Function qui fait un retourne un refresh token
 * @param {UserInterfaces} user 
 */
const getRefreshToken = async(user: any) => {
    const payload: any = {
        iss: "deno-imie-api",
        id: user.id,
        exp: getNumericDate(new Date().getTime() + parseInt(JWT_REFRESH_TOKEN_EXP)),
    };

    return await create(header, payload, JWT_TOKEN_SECRET);
};

/**
 * Function qui test le token et recupere le payload du token
 */
const getJwtPayload = async(ctx: RouterContext, tokenHeader: string | null): Promise < any | null > => {
    try {
        if (tokenHeader) {
            const token = tokenHeader.replace(/^bearer/i, "").trim();
            const jwtObject = await verify(token, JWT_TOKEN_SECRET, header.alg);
            if (jwtObject && jwtObject !== null && jwtObject !== undefined) {
                return jwtObject;
            }
        }
        return null;
    } catch (err) {
        console.log(err)
    }
    return null;
};

export { getAuthToken, getRefreshToken, getJwtPayload };