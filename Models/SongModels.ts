import type { float, DateString } from 'https://deno.land/x/etype/mod.ts';
import { SongDB } from "../db/SongDB.ts";
import SongInterfaces from "../interfaces/SongInterfaces.ts";

export class SongModels extends SongDB implements SongInterfaces {
    [x: string]: any;
    //private id: { $oid: string } | null = null;
    id?: number;
    name: string;
    url: string;
    cover: string;
    time: string;
    type: string;
    createdAt?: Date;
    updateAt?: Date;

    constructor(name: string, url: string, cover: string, time: string, type: string ) {
        super();
        this.name = name;
        this.url = url;
        this.cover = cover;
        this.time = time;
        this.type = type;
        this.createdAt = new Date();
        this.updateAt = new Date();
    }

    /*get _id(): string | null{
        return (this.id === null) ? null : this.id.$oid;
    }

    setId (id: { $oid: string } | null): void{
        this.id = id;
    }*/

    async insert(): Promise < any > {
        await this.songdb.insertOne({
            id: (await this.selectAllSongs({})).length + 1,
            name : this.name,
            url : this.url,
            cover : this.cover,
            time : this.time,
            type : this.type,
            createdAt : this.createdAt,
            updateAt : this.updateAt
        });
    }
}