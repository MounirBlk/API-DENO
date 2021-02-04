import { cardTypes } from "./cardTypes.ts";
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
    childsTab?: Array<any>;
    cardInfos?: Array<cardTypes>;
    dateSouscription?: Date;
    customerId? : string;
}
    

