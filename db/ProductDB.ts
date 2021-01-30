import { db } from './db.ts';

export class ProductDB{

    protected productdb: any;
    constructor(){
        this.productdb = db.collection<any>("products");
    }
    
    async selectProduct(objectFind: Object):Promise <any>{
        return await this.productdb.findOne(objectFind)
    }
    async count(objectCount: Object):Promise <number>{
        return await this.productdb.count(objectCount)
    }
    async delete(objectForRemove: Object):Promise <any>{
        return await this.productdb.deleteOne(objectForRemove)
    }
    async selectAllProducts(objectSelectAll: Object):Promise <any>{
        return await this.productdb.find(objectSelectAll).toArray()
    }
    
    async insert(objectToAdd: Object): Promise < any > {
        await this.productdb.insertOne(objectToAdd);
    }
}