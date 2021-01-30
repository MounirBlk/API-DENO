import { cardTypes } from "../types/cardTypes.ts";
import { roleTypes } from '../types/roleTypes.ts';
import { userUpdateTypes } from '../types/userUpdateTypes.ts';

export default interface UserInterfaces {

    _id: { $oid: string }|null|string;
    email: string;
    password: string;
    lastname: string;
    firstname: string;
    subscription : number;
    sexe: string;
    dateNaissance: string;
    role: roleTypes;
    createdAt?: Date;
    updateAt?: Date;
    attempt: number;
    token?: string | null;
    childsTab: Array<any>;
    cardInfos?: cardTypes;
    dateSouscription?: Date;
    customerId? : string;
    
    // getAge(): Number;
    // fullName(): string;
    insert(): Promise < any > ;
    update(update:userUpdateTypes): Promise < any > ;
    delete(objectCount: Object): Promise < any > ;
}


// créé avec succès", "user": { "firstname": "xxxxxx", "lastname": "xxxxxx", 
// "email": "xxxxxx", "sexe": "xxxxxx", "role": "xxxxx", "dateNaissance": "xxxx-xx-xx", 
// "createdAt": "xxxxxx", "updateAt": "xxxxxx", "subscription": 0 } }