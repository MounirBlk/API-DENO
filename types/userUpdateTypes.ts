import { roleTypes } from './roleTypes.ts';
export type userUpdateTypes = 
{
    email?: string,
    password?: string,
    lastname?: string,
    firstname?: string,
    phoneNumber ? : string,

    dateNaiss?: Date,
    role?: roleTypes,
}