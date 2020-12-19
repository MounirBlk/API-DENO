import { db } from './db.ts';
import UserInterfaces from '../interfaces/UserInterfaces.ts';

export class UserDB{

    protected userdb: any;
    constructor(){
        this.userdb = db.collection<UserInterfaces>("users");
    }


    update(): Promise < any > {
        throw new Error('Method not implemented.');
    }
    delete(): Promise < any > {
        throw new Error('Method not implemented.');
    }
}