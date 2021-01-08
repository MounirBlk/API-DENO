export default class EmailException extends Error {

    constructor() {
        super('Email is not valid')
    }
    /**
     * Methode qui check la conformité de l'email
     * @param {string} email 
     */
    static isValidEmail(email: string): boolean {
        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return (reg.test(email.toLowerCase().trim()))
    }
}