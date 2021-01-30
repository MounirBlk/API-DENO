import axiod from "https://deno.land/x/axiod/mod.ts";
import { config } from '../config/config.ts';

const {
    STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY
} = config;


/**
 *  Add card stripe
 */ 
export const addCardStripe = async(idCustomer: string, numberCard: number, exp_month: number, exp_year: number, cvc: number) => {
    let payload: any = {
        "type": "card",//spécifier le type !
        "card[number]": String(numberCard),
        "card[exp_month]": String(exp_month),
        "card[exp_year]": String(exp_year),
        "card[cvc]": String(cvc),//optional
    };
    const dataBody = convertToFormBody(payload);
    console.log(idCustomer)
    return await axiod(`https://api.stripe.com/v1/customers/${idCustomer}/sources`, getConfigAxiod('post', dataBody))
}

/**
 *  Add customer stripe
 */ 
export const addCustomerStripe = async(email: string, fullName: string): Promise<any> => {
    let payload: any = {
        "email": email,
        "name": fullName
    };
    const dataBody = convertToFormBody(payload);
    return await axiod("https://api.stripe.com/v1/customers", getConfigAxiod('post', dataBody))
}

/**
 *  Update customer stripe
 */ 
export const updateCustomerStripe = async(idCustomer: string, idCard: string) => {
    let payload: any = {
        'source' : idCard
    };
    const dataBody = convertToFormBody(payload);
    return await axiod("https://api.stripe.com/v1/customers/" + idCustomer, getConfigAxiod('post', dataBody))
}

/**
 *  Conversion to form body
 *  @param methodReq post / get / put / delete ...
 *  @param dataBody data from body
 */ 
const getConfigAxiod = (methodReq: string, dataBody?: any) => {
    return {
        method: methodReq.trim().toLowerCase(),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`, 
        },
        data: dataBody
    };
}

/**
 *  Conversion to form body
 */ 
const convertToFormBody = (cardDetails: any) => {
    let formBody: any = [];
    for (let property in cardDetails) {
        //cardDetails.hasOwnProperty(property)
        formBody.push(encodeURIComponent(property) + '=' + encodeURIComponent(cardDetails[property]));
    }
    return formBody.join("&");
}

/**
 *  Conversion to UrlEncoded
 */ 
const toUrlEncoded = (obj: any) => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

/**
 *  Conversion to form data
 */ 
const getFormData = (object: any) => {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
}