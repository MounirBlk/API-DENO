import { FactureDB } from "../db/FactureDB.ts";
import FactureInterfaces from "../interfaces/FactureInterfaces.ts";

export class FactureModels extends FactureDB implements FactureInterfaces {
    [x: string]: any;
    private id: { $oid: string } | null = null;

    id_Stripe: string;
    date_payment: Date;// string ?
    montant_ht: string;
    montant_ttc: string;
    source: string;
    createdAt?: Date;
    updateAt?: Date;
    idUser: { $oid: string } | string | null;

    constructor(id_Stripe: string, date_payment: Date, montant_ht: string, montant_ttc: string, source: string, idUser: { $oid: string } | string | null) {
        super();
        this.id_Stripe = id_Stripe;
        this.date_payment = date_payment; // new Date()
        this.montant_ht = montant_ht;
        this.montant_ttc = montant_ttc;
        this.source = source;
        this.createdAt = new Date();
        this.updateAt = new Date();
        this.idUser = idUser;
    }

    get _id(): string | null{
        return (this.id === null) ? null : this.id.$oid;
    }

    setId (id: { $oid: string } | null): void{
        this.id = id;
    }

    async insert(): Promise < any > {
        this.id = await this.facturedb.insertOne({
            id_Stripe : this.id_Stripe,
            date_payment : this.date_payment,
            montant_ht : this.montant_ht,
            montant_ttc : this.montant_ttc,
            source : this.source,
            createdAt : this.createdAt,
            updateAt : this.updateAt,
            idUser : this.idUser,
        });
        return this.id;
    }
}