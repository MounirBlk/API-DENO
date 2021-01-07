import { roleTypes } from './roleTypes.ts';
export type userUpdateTypes = 
{
    firstname?: string,
    lastname?: string,
    email?: string,
    password?: string,
    sexe?: string,
    role?: roleTypes,
    dateNaissance?: string,
    createdAt?: Date,
    updateAt?: Date,
    attempt? : number,
    subscription ? : number,
    token?: string | null
    idChildsTab?: Array<any>;
}
    

