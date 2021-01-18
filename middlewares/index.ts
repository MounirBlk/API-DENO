import { RouterContext } from "https://deno.land/x/oak/mod.ts";//download
import { UserDB } from "../db/userDB.ts";
import { Bson } from "https://deno.land/x/mongo@v0.20.1/mod.ts";

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
 *  @param {Object} user Utilisateur
 *  @param {string} mapperNameRoute Nom de la route
 */ 
const deleteMapper = (user: any, mapperNameRoute: string): any => {
    /*mapperNameRoute === 'login' || mapperNameRoute === 'newChild' || mapperNameRoute === 'getChilds' || mapperNameRoute === 'register' ? delete user._id : null;
    mapperNameRoute === 'login' || mapperNameRoute === 'newChild' || mapperNameRoute === 'getChilds' || mapperNameRoute === 'register' ? delete user.password : null;
    mapperNameRoute === 'login' || mapperNameRoute === 'newChild' || mapperNameRoute === 'getChilds' ? delete user.attempt : null;
    mapperNameRoute === 'login' || mapperNameRoute === 'newChild' || mapperNameRoute === 'getChilds'? delete user.token : null;
    mapperNameRoute === 'login' || mapperNameRoute === 'newChild' || mapperNameRoute === 'getChilds' ? delete user.childsTab : null;    
    mapperNameRoute === 'newChild' ? delete user.userdb : null;
    mapperNameRoute === 'newChild' ? delete user.id : null;*/
    delete user.id;
    delete user._id
    delete user.userdb;
    delete user.password;
    delete user.attempt;
    delete user.token;
    delete user.childsTab;
    user = mapperNameRoute === 'newChild' ? renameKey(user, '_role', 'role') : user;
    return user;
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
    let regexText = /^[^@"()/!_$*€£`+=;?#]+$/ // regex:  /^[^@&"()!_$*€£`+=\/;?#]+$/
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
}

/**
 *  Function vérification si le mdp possede 6 caracteres min
 */ 
const isValidPassword = (password: string): boolean => {
    return password.length >= 6 ? true : false;
}

/**
 *  Function change le nom de la cle d'un objet
 */
const renameKey = (object: any, key: any, newKey: any) => {
    const clonedObj = clone(object);
    const targetKey = clonedObj[key];
    delete clonedObj[key];
    clonedObj[newKey] = targetKey;
    return clonedObj;
};

const clone = (obj: any) => Object.assign({}, obj);

/**
 * Function qui retourne les enfants d'un parent
 * @param {Bson.ObjectId} payloadToken.id id du parent
 */
const getChildsByParent = async(payloadTokenID: any): Promise< Array<any> > => {
    const dbColParent = new UserDB();
    let userParent = await dbColParent.selectUser({ _id: new Bson.ObjectId(payloadTokenID) })
    let childs: Array<any> = [];
    /*userParent.childsTab.forEach(async(element) => {
        let child = await new UserDB().selectUser({ _id: new Bson.ObjectId(element) })
        childs.push(child)
    });*/
    if(userParent.childsTab.length === 1){
        let childOne = await new UserDB().selectUser({ _id: new Bson.ObjectId(userParent.childsTab[0]) })
        childs.push(deleteMapper(childOne, 'getChilds'))
    }else if(userParent.childsTab.length === 2){
        let childOne = await new UserDB().selectUser({ _id: new Bson.ObjectId(userParent.childsTab[0]) })
        let childTwo = await new UserDB().selectUser({ _id: new Bson.ObjectId(userParent.childsTab[1]) })
        childs.push(deleteMapper(childOne, 'getChilds'))
        childs.push(deleteMapper(childTwo, 'getChilds'))
    }else if (userParent.childsTab.length === 3){
        let childOne = await new UserDB().selectUser({ _id: new Bson.ObjectId(userParent.childsTab[0]) })
        let childTwo = await new UserDB().selectUser({ _id: new Bson.ObjectId(userParent.childsTab[1]) })
        let childThree = await new UserDB().selectUser({ _id: new Bson.ObjectId(userParent.childsTab[2]) })
        childs.push(deleteMapper(childOne, 'getChilds'))
        childs.push(deleteMapper(childTwo, 'getChilds'))
        childs.push(deleteMapper(childThree, 'getChilds'))
    }else{
        childs = []
    }
    return childs;
}

export { dataRequest, sendReturn, isValidPassword, deleteMapper, exist, dateFormatFr, dateFormatEn, emailFormat, passwordFormat, zipFormat, textFormat, numberFormat, floatFormat, getChildsByParent};
