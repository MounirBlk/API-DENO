import { roleTypes } from './roleTypes.ts';
export type userUpdateTypes = 
{

    email?: string,
    password?: string,
    lastname?: string,
    firstname?: string,
   

    dateNaiss?: Date,

    role?: roleTypes,
    subscription ? : Number,
    sexe?: string,

    createdAt?: Date,
    updateAt?: Date,
}
    

