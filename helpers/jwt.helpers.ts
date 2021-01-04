import { create, verify, decode, getNumericDate } from "https://deno.land/x/djwt@v2.0/mod.ts";
import { config } from '../config/config.ts';


const {
    JWT_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_EXP,
    JWT_REFRESH_TOKEN_EXP,
} = config;

const header: any = {
    alg: "HS256",
    typ: "JWT",
};

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

const getRefreshToken = async(user: any) => {
    const payload: any = {
        iss: "deno-imie-api",
        id: user.id,
        exp: getNumericDate(new Date().getTime() + parseInt(JWT_REFRESH_TOKEN_EXP)),
    };

    return await create(header, payload, JWT_TOKEN_SECRET);
};

const getJwtPayload = async(token: string): Promise < any | null > => {
    try {
        const jwtObject = await verify(token, JWT_TOKEN_SECRET, header.alg);
        if (jwtObject && jwtObject.payload) {
            return jwtObject.payload;
        }
    } catch (err) {}
    return null;
};

export { getAuthToken, getRefreshToken, getJwtPayload };