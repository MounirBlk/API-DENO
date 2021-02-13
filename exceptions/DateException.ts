export default class DateException extends Error {

    constructor() {
        super('Date is not valid')
    }
    /**
     * Methode qui check la conformité de la date
     * @param {string} date 
     */
    static isValidDate(date: string): boolean {
        const reg = /^\d{4}\-\d{1,2}\-\d{1,2}$/ //reg date incorrecte !!
        return (reg.test(date.toLowerCase().trim()))
    }

    /**
     * Methode qui check la conformité de la datetime
     * @param {string} date 
     */
    static isValidDateTime(date: string): boolean {
        const reg = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
        return (reg.test(date.toLowerCase().trim()))
    }
}