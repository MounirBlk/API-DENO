import type { DateString, float } from 'https://deno.land/x/etype/mod.ts';

export default interface FactureInterfaces {

    //_id: { $oid: string }|null|string;
    id?: number;
    id_Stripe: string;
    date_payment: DateString;// string ?
    montant_ht: float;
    montant_ttc: float;
    source: string;
    createdAt?: Date;
    updateAt?: Date;
    idUser: { $oid: string } | string | null;

    insert(): Promise < any > ;
}