import { isValidLength } from "../middlewares/index.ts"

export default class EmailException extends Error {

    constructor() {
        super('Email is not valid')
    }
    /**
     * Methode qui check la conformité de l'email (taille entre 10 et 150 caracteres)
     * @param {string} email 
     */
    static isValidEmail(email: string): boolean {
        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return (isValidLength(email, 10, 150) ? reg.test(email.toLowerCase().trim()) : false)
    }
}