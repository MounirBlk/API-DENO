import SongInterfaces from '../interfaces/SongInterfaces.ts';
import { db } from './db.ts';

export class SongDB{

    protected songdb: any;
    constructor(){
        this.songdb = db.collection<SongInterfaces>("songs");
    }
    
    async selectSong(objectFind: Object):Promise <SongInterfaces>{
        return await this.songdb.findOne(objectFind)
    }
    async count(objectCount: Object):Promise <number>{
        return await this.songdb.count(objectCount)
    }
    async delete(objectForRemove: Object):Promise <any>{
        return await this.songdb.deleteOne(objectForRemove)
    }
    async selectAllSongs(objectSelectAll: Object):Promise <any>{
        return await this.songdb.find(objectSelectAll).toArray()
    }
    async getUniqId(): Promise <any>{
        let allSongs = await this.selectAllSongs({})
        let uniqId = 1;
        for(let i = 0; i < allSongs.length; i++){
            uniqId = (uniqId <= allSongs[i].idlol) ? (allSongs[i].idlol + 1) : uniqId
        }
        return uniqId;
    }
}