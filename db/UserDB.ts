import { db } from './db.ts';
import UserInterfaces from '../interfaces/UserInterfaces.ts';

export class UserDB{

    protected userdb: any;
    constructor(){
        this.userdb = db.collection<UserInterfaces>("users");
    }
    
    /*async getUser(email: any): Promise < UserInterfaces > {
        const user = await this.userdb.findOne({ email: email.trim().toLowerCase() })
        return user;
    }*/

    delete(): Promise < any > {
        throw new Error('Method not implemented.');
    }
}