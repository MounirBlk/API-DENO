import { db } from './db.ts';
import UserInterfaces from '../interfaces/UserInterfaces.ts';

export class UserDB{

    protected userdb: any;
    constructor(){
        this.userdb = db.collection<UserInterfaces>("users");
    }
    
    async selectUser(email: string):Promise <UserInterfaces>{
        return await this.userdb.findOne({ email: email.trim().toLowerCase() })
    }

    delete(): Promise < any > {
        throw new Error('Method not implemented.');
    }
}