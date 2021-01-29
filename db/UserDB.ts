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
    async delete(objectForRemove: Object):Promise <any>{
        return await this.userdb.deleteOne(objectForRemove)
    }
    async selectAllUsers(objectSelectAll: Object):Promise <any>{
        return await this.userdb.find(objectSelectAll).toArray()
    }
    async getUniqId(): Promise <any>{
        let allUsers = await this.selectAllUsers({})
        let uniqId = 1;
        for(let i = 0; i < allUsers.length; i++){
            uniqId = (uniqId <= allUsers[i].id) ? (allUsers[i].id + 1) : uniqId
        }
        return uniqId;
    }
}