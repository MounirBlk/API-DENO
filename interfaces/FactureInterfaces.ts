export default interface FactureInterfaces {

    _id: { $oid: string }|null|string;
    id_Stripe: string;
    date_payment: Date;// string ?
    montant_ht: string;
    montant_ttc: string;
    source: string;
    createdAt?: Date;
    updateAt?: Date;
    idUser: { $oid: string } | string | null;

    insert(): Promise < any > ;
}