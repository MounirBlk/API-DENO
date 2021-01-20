export default interface FactureInterfaces {

    _id: { $oid: string }|null|string;
    name: string;
    url: string;
    cover: string;
    time: string;
    createdAt: Date;
    updateAt: Date;
    type: string;
    //idUser: { $oid: string } | string | null;
}