
import { hash } from '../helpers/password.helpers.ts';
import { UserDB } from '../db/userDB.ts';
import { roleTypes } from '../types/roleTypes.ts';

import UserInterfaces from '../interfaces/UserInterfaces.ts';
import { userUpdateTypes } from '../types/userUpdateTypes.ts';

export class UserModels extends UserDB implements UserInterfaces {
    [x: string]: any;
    private _role: roleTypes = "tuteur";
    private id:{ $oid: string }|null = null;

    email: string;
    dateNaiss: Date;
    password: string;
    lastname: string;
    firstname: string;
    subscription  : Number;
    sexe: string;

    createdAt: Date;
    updateAt: Date;



    constructor(email: string, password: string, nom: string, prenom: string, tel: string, dateNaiss: Date, sexe: string, createdAt: Date, updateAt: Date, subscription  : Number) {
        super();
        this.email = email;
        this.lastname = nom;
        this.firstname = prenom;
        this.password = password;
        this.dateNaiss = new Date(dateNaiss);
        this.subscription= subscription;
        this.createdAt= new Date();
        this.updateAt = new Date();
        this.sexe = sexe;
    }

    get _id():string|null{
        return (this.id === null)?null: this.id.$oid;
    }

    get role():roleTypes{
        return this._role;
    }

    setRole(role: roleTypes): void {
        this._role = role;
        this.update({role: role});
    }
    // getAge(): Number {
    //     var ageDifMs = Date.now() - this.dateNaiss.getTime();
    //     var ageDate = new Date(ageDifMs);
    //     return Math.abs(ageDate.getUTCFullYear() - 1970);
    // // }
    // fullName(): string {
    //     return `${this.lastname} ${this.firstname}`;
    // }
    async insert(): Promise < void > {
        this.password = await hash(this.password);
        this.id = await this.userdb.insertOne({
            role: this._role,
            email: this.email,
            password: this.password,
            lastname: this.lastname,
            firstname: this.firstname,
            dateNaiss: this.dateNaiss,
            subscription: this.subscription,
            sexe: this.sexe,
            createdAt: this.createdAt,
            updateAt: this.updateAt,
            
        });
    }
    async update(update:userUpdateTypes): Promise < any > {
        const { modifiedCount } = await this.userdb.updateOne(
            { _id: this.id },
            { $set: update }
          );
          
    }
    delete(): Promise < any > {
        throw new Error('Method not implemented.');
    }
}