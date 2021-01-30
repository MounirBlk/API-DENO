import axiod from "https://deno.land/x/axiod/mod.ts";
import { config } from '../config/config.ts';

const {
    STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY
} = config;


/**
 *  Add card token stripe
 */ 
export const addCardStripe = async(numberCard: number, exp_month: number, exp_year: number, cvc?: number) => {
    let payload: any = {
        "card[number]": String(numberCard),
        "card[exp_month]": String(exp_month),
        "card[exp_year]": String(exp_year),
        //"card[cvc]": String(cvc),//optional
    };
    
    const dataBody = convertToFormBody(payload);
    return await axiod(`https://api.stripe.com/v1/tokens`, getConfigAxiod('post', dataBody))//
}

/**
 *  Add customer stripe
 */ 
export const addCustomerStripe = async(email: string, fullName: string) => {
    let payload: any = {
        "email": email,
        "name": fullName,
    };
    const dataBody = convertToFormBody(payload);
    return await axiod("https://api.stripe.com/v1/customers", getConfigAxiod('post', dataBody))
}

/**
 *  Update customer with card token (secure) stripe
 */ 
export const updateCustomerCardStripe = async(idCustomer: string, idCard: string) => {
    let payload: any = {
        'source' : idCard
    };
    const dataBody = convertToFormBody(payload);
    return await axiod(`https://api.stripe.com/v1/customers/${idCustomer}/sources`, getConfigAxiod('post', dataBody))
}

/**
 *  Ajout du produit stripe
 */ 
export const addProductStripe = async(name: string, description: string, unitAmount: number = 500, currency: string = 'eur') => {
    let payload: any = {
        name: name,
        description: description
    };
    const dataBody = convertToFormBody(payload);
    const responseAddProduct = await axiod(`https://api.stripe.com/v1/products`, getConfigAxiod('post', dataBody))
    return await addPriceProductStripe(responseAddProduct.data.id, unitAmount, currency);
}

/**
 *  Ajout du price sur un produit
 */ 
const addPriceProductStripe = async(idProduct: string, unitAmount: number = 500, currency: string = 'eur') => {
    let payload: any = {
        "product": idProduct,
        "currency": currency.toLowerCase(),
        "unit_amount": unitAmount < 0 ? 500 : unitAmount,
        "billing_scheme": "per_unit",
        "recurring[interval]":"month",
        "recurring[interval_count]":"1",
        "recurring[trial_period_days]":"0",
        "recurring[usage_type]":"licensed"
        //"unit_amount_decimal": unitAmount < 0 ? String(500) : String(unitAmount),
    };
    const dataBody = convertToFormBody(payload);
    return await axiod(`https://api.stripe.com/v1/prices`, getConfigAxiod('post', dataBody))
}

/**
 *  Payment abonnement au produit
 */ 
export const paymentStripe = async(idCustomer: string | undefined, idPrice: string, quantity: number = 1) => {
    if(idCustomer === null || idCustomer === undefined){
        return;
    }else{
        let payload: any = {
            "customer": idCustomer,
            "off_session": String(true),
            "collection_method": "charge_automatically",
            "items[0][price]": idPrice,
            "items[0][quantity]": String(quantity),
            "enable_incomplete_payments": String(false) // Champ a vérifier et confirmer
        };
        const dataBody = convertToFormBody(payload);
        return await axiod(`https://api.stripe.com/v1/subscriptions`, getConfigAxiod('post', dataBody))
    }
}

/**
 *  Conversion to form body
 *  @param methodReq post / get / put / delete ...
 *  @param dataBody data from body
 */ 
const getConfigAxiod = (methodReq: string, dataBody: any = null) => {
    const configAxiod = {
        method: methodReq.trim().toLowerCase(),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`, 
        },
        data: dataBody
    };
    dataBody === null ? delete configAxiod.data : configAxiod;
    return configAxiod;
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