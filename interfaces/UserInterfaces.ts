import { roleTypes } from '../types/roleTypes.ts';
import { userUpdateTypes } from '../types/userUpdateTypes.ts';

export default interface UserInterfaces {

    _id: { $oid: string }|null|string;

    email: string;
    password: string;
    lastname: string;
    firstname: string;
    subscription  : number;
    sexe: string;
    dateNaissance: string;
    role: roleTypes;
    createdAt?: Date;
    updateAt?: Date;
    attempt: number;
    token?: string | null;

    // getAge(): Number;
    // fullName(): string;
    insert(): Promise < void > ;
    update(update:userUpdateTypes): Promise < any > ;
    delete(): Promise < any > ;
}


// créé avec succès", "user": { "firstname": "xxxxxx", "lastname": "xxxxxx", 
// "email": "xxxxxx", "sexe": "xxxxxx", "role": "xxxxx", "dateNaissance": "xxxx-xx-xx", 
// "createdAt": "xxxxxx", "updateAt": "xxxxxx", "subscription": 0 } }