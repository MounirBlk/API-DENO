import { db } from './db.ts';
import UserInterfaces from '../interfaces/UserInterfaces.ts';

export class UserDB{

    protected userdb: any;
    constructor(){
        this.userdb = db.collection<UserInterfaces>("users");
    }
    
    async selectUser(objectFind: Object):Promise <UserInterfaces>{
        return await this.userdb.findOne(objectFind)
    }
    async count(objectCount: Object):Promise <number>{
        return await this.userdb.count(objectCount)
    }
    async delete(objectCount: Object):Promise <any>{
        return await this.userdb.deleteOne(objectCount)
    }
}