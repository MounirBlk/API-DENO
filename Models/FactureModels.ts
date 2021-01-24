import { FactureDB } from "../db/FactureDB.ts";
import FactureInterfaces from "../interfaces/FactureInterfaces.ts";
import { Double } from "https://deno.land/x/mongo@v0.20.1/bson/bson.d.ts";
import type { float, DateString } from 'https://deno.land/x/etype/mod.ts';

export class FactureModels extends FactureDB implements FactureInterfaces {
    [x: string]: any;
    //private id: { $oid: string } | null = null;
    id?: number;
    id_Stripe: string;
    date_payment: DateString;// string ?
    montant_ht: float;
    montant_ttc: float;
    source: string = 'Stripe';
    createdAt?: Date;
    updateAt?: Date;
    idUser: { $oid: string } | string | null;

    constructor(id_Stripe: string, date_payment: DateString, montant_ht: float, montant_ttc: float,/* source: string,*/ idUser: { $oid: string } | string | null) {
        super();
        this.id_Stripe = id_Stripe;
        this.date_payment = date_payment; // new Date()
        this.montant_ht = montant_ht;
        this.montant_ttc = montant_ttc;
        //this.source = source;
        this.createdAt = new Date();
        this.updateAt = new Date();
        this.idUser = idUser;
    }

    /*get _id(): string | null{
        return (this.id === null) ? null : this.id.$oid;
    }

    setId (id: { $oid: string } | null): void{
        this.id = id;
    }*/

    async insert(): Promise < any > {
        /*this.id = */await this.facturedb.insertOne({
            id: (await this.selectAllFactures({})).length + 1,
            id_Stripe : this.id_Stripe,
            date_payment : this.date_payment,
            montant_ht : this.montant_ht,
            montant_ttc : this.montant_ttc,
            source : this.source,
            createdAt : this.createdAt,
            updateAt : this.updateAt,
            idUser : this.idUser,
        });
    }
}