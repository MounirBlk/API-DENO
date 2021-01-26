import FactureInterfaces from "../interfaces/FactureInterfaces.ts";
import { db } from './db.ts';

export class FactureDB{

    protected facturedb: any;
    constructor(){
        this.facturedb = db.collection<FactureInterfaces>("factures");
    }
    
    async selectFacture(objectFind: Object):Promise <FactureInterfaces>{
        return await this.facturedb.findOne(objectFind)
    }
    async count(objectCount: Object):Promise <number>{
        return await this.facturedb.count(objectCount)
    }
    async delete(objectForRemove: Object):Promise <any>{
        return await this.facturedb.deleteOne(objectForRemove)
    }
    async selectAllFactures(objectSelectAll: Object):Promise <any>{
        return await this.facturedb.find(objectSelectAll).toArray()
    }
    async getUniqId(): Promise <any>{
        let allFactures = (await this.selectAllFactures({}))
        let uniqId = 1;
        for(let i = 0; i < allFactures.length; i++){
            uniqId = (uniqId <= allFactures[i].idlol) ? (allFactures[i].idlol + 1) : uniqId
        }
        return uniqId;
    }
}