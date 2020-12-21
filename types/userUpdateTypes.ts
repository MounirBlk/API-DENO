import { roleTypes } from './roleTypes.ts';
export type userUpdateTypes = 
{
    firstname?: string,
    lastname?: string,
    email?: string,
    password?: string,
    sexe?: string,
    role?: roleTypes,
    dateNaissance?: Date,
    createdAt?: Date,
    updateAt?: Date,
    attempt? : Number,
    subscription ? : Number,
}
    

