export default interface SongInterfaces {

    //_id: { $oid: string }|null|string;
    id?: number;
    name: string;
    url: string;
    cover: string;
    time: string;
    type: string;
    createdAt?: Date;
    updateAt?: Date;
    //idUser: { $oid: string } | string | null;
}