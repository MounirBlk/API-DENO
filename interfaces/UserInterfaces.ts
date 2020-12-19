import { roleTypes } from '../types/roleTypes.ts';
import { userUpdateTypes } from '../types/userUpdateTypes.ts';

export default interface UserInterfaces {

    _id: { $oid: string }|null|string;

    email: string;
    password: string;
    lastname: string;
    firstname: string;
    phoneNumber ? : string;

    dateNaiss: Date;
    role: roleTypes;

    getAge(): Number;
    fullName(): string;
    insert(): Promise < void > ;
    update(update:userUpdateTypes): Promise < any > ;
    delete(): Promise < any > ;
}