import { create, verify, decode, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";
import { config } from '../config/config.ts';
import UserInterfaces from "../interfaces/UserInterfaces.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { binaryToText, dataResponse, isValidLength, textToBinary } from "../middlewares/index.ts";
import { UserDB } from "../db/userDB.ts";

const {
    JWT_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXP,
    JWT_REFRESH_TOKEN_EXP,
} = config;

const header: any = {
    alg: "none",//HS256 HS512 none
    typ: "JWT",
};

/**
 * Function qui fait un retourne de token
 * @param {UserInterfaces} user 
 */
const getAuthToken = async (id: any): Promise < string >  => {
    const payload: any = {
        id: id,
        //role: user.role,
        exp: getNumericDate(new Date().getTime() + parseInt(JWT_ACCESS_TOKEN_EXP)),
    };
    let token = await create(header, payload, JWT_TOKEN_SECRET)
    return token.split('.')[1];
};


/**
 * Function qui fait un retourne un refresh token
 * @param {UserInterfaces} user 
 */
const getRefreshToken = async(user: any) => {
    const payload: any = {
        //iss: "deno-imie-api",
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
            if(isValidLength(token, 50, 90)){
                const jwtObject = await verify( getFullToken(token, header.alg), JWT_TOKEN_SECRET, header.alg );
                if (await new UserDB().count({token: token}) === 0) {
                    return null;
                }else{
                    if (jwtObject && jwtObject !== null && jwtObject !== undefined) {
                        return jwtObject;
                    }
                }
            }else{
                return null;//mettre a false pour générer erreur conformité
            }
        }
        return null;
    } catch (err) {
        console.log(err)
    }
    return null;
};

const getFullToken = (payloadToken: string, alg: string): string => {
    let headerToken: string = '';
    let signatureToken: string = '';
    if(alg.toLowerCase() === 'none' || alg === 'NONE'){//header du token avec l'algorithme a none
        headerToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0'.concat('.');
        signatureToken = '.'.concat('');
    }

    //if(alg.toLowerCase() === 'hs256' || alg === 'HS256'){
    //    headerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'.concat('.')
    //    signatureToken = '.'.concat('r40HdLifzra_N1Y_gNvbv4T5UNK56uJwHE-uQNEXGW4')
    //}

    //if(alg.toLowerCase() === 'hs512' || alg === 'HS512'){
    //    headerToken = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9'.concat('.')
    //    signatureToken = '.'.concat('dYOHvldvbFoaO2_dCgQV7-rw2MwzQ1-pMoYxFp3j5L9HKulAp2ysSYWnxb7OoF5cDoXBDfS3NNVR5vH_2CNpHw')
    //}
    const fullToken: string = headerToken + payloadToken + signatureToken;
    return fullToken;
}

export { getAuthToken, getRefreshToken, getJwtPayload };