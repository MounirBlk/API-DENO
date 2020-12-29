import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download

/**
 * Function qui fait un retourne les données envoyéss
 * @param {RouterContext} ctx 
 */
const dataRequest = async (ctx: RouterContext) => {
    const body: any = ctx.request.body();
    let data;
    if (body.type === "json") {
        data = await body.value;
    } else if (body.type === "form") {
        data = {};
        for (const [key, value] of await body.value) {
            data[key as keyof Object] = value;
        }
    } else if (body.type === "form-data") {
        const formData = await body.value.read();
        data = formData.fields;
    }
    return data;
}

/**
 * Function qui fait un retour d'une donnée
 * @param {RouterContext} ctx 
 * @param {Number} status 
 * @param {Object} data 
 */
const sendReturn = (ctx: RouterContext, status: number = 500, data: any = { error: true, message: "Processing error" }) => {
    ctx.response.headers.append('Content-Type','application/json')
    try {
        ctx.response.status = status;
        ctx.response.body = data;
    } catch (error) {
        //Cette erreur ne DOIT jamais apparaitre
        let sendError = { error: true, message: "Processing error !" }
        ctx.response.status = 500;
        ctx.response.body = sendError;
    }
}

/**
 *  Function qui supprime les données return initule
 */ 
const deleteUserMapper = (data: any): any => {
    delete data._id;
    delete data.password;
    delete data.attempt;
    return data;
}

/**
 *  Function qui vérifie l'existence d'une data
 */ 
const exist = (data: string): Boolean => {
    if (data == undefined || data.trim().length == 0 || data == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si la date est dans le bon format à l'envoi (FR)
 */ 
const dateFormatFr = (data: string): Boolean => {
    let regexDate = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
    if (data.match(regexDate) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si la date est dans le bon format à l'envoi (US)
 */ 
const dateFormatEn = (data: string): Boolean => {
    let regexDate = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/
    if (data.match(regexDate) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si l'email est dans le bon format
 */ 
const emailFormat = (data: string): Boolean => {
    let regexEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    if (data.match(regexEmail) == null)
        return false
    else
        return true
}

/**
 *  Function vérification password
 */ 
const passwordFormat = (data: string): Boolean => {
    let regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
    return data.match(regexPassword) == null || data === undefined ? false : true
}

/**
 *  Function vérification de si le zip est dans le bon format
 */ 
const zipFormat = (data: string): Boolean => {
    let regexZip = /^(([0-8][0-9])|(9[0-5]))[0-9]{3}$/
    if (data.match(regexZip) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si le text est dans le bon format
 */ 
const textFormat = (data: string): Boolean => {
    let regexText = /^[^@"()!_$*€£`+=;?#]+$/ // regex:  /^[^@&"()!_$*€£`+=\/;?#]+$/
    if (data.match(regexText) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si la date est dans le format number
 */ 
const numberFormat = (data: string): Boolean => {
    let regexNumber = /^[0-9]+$/
    if (data.match(regexNumber) == null)
        return false
    else
        return true
}

/**
 *  Function vérification de si la date est dans le format float
 */ 
const floatFormat = (data: string): Boolean => {
    let regexFloat = /^[0-9]+(\.[0-9]{0,})$/
    if (data.match(regexFloat) == null)
        return false
    else
        return true
        
export { dataRequest, sendReturn, deleteUserMapper, exist, dateFormatFr, dateFormatEn, emailFormat, passwordFormat, zipFormat, textFormat, numberFormat, floatFormat};