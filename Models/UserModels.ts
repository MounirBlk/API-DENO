
import { hash } from '../helpers/password.helpers.ts';
import { UserDB } from '../db/userDB.ts';
import { roleTypes } from '../types/roleTypes.ts';
import UserInterfaces from '../interfaces/UserInterfaces.ts';
import { userUpdateTypes } from '../types/userUpdateTypes.ts';

export class UserModels extends UserDB implements UserInterfaces {
    [x: string]: any;
    private _role: roleTypes = "tuteur";
    private id:{ $oid: string }| null = null;

    email: string;
    dateNaissance: string;
    password: string;
    lastname: string;
    firstname: string;
    subscription  : number;
    sexe: string;
    createdAt?: Date;
    updateAt?: Date;
    attempt: number;
    token?: string | null = null;
    childsTab: Array<any> = [] ;

    constructor(email: string, password: string, lastname: string, firstname: string, dateNaissance: string, sexe: string, attempt:number, subscription  : number ) {
        super();
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.sexe = sexe;
        this.dateNaissance = dateNaissance;
        this.createdAt= new Date();
        this.updateAt = new Date();
        this.attempt = attempt;
        this.subscription= subscription;
    }

    get _id(): string | null{
        return (this.id === null) ? null : this.id.$oid;
    }

    get role():roleTypes{
        return this._role;
    }

    setRole(role: roleTypes): void {
        this._role = role;
        this.update({role: role});
    }
    
    setId (id: { $oid: string } | null): void{
        this.id = id;
    }
    // getAge(): Number {
    //     var ageDifMs = Date.now() - this.dateNaiss.getTime();
    //     var ageDate = new Date(ageDifMs);
    //     return Math.abs(ageDate.getUTCFullYear() - 1970);
    // // }
    // fullName(): string {
    //     return `${this.lastname} ${this.firstname}`;
    // }
    async insert(): Promise < any > {
        this.password = await hash(this.password);
        this.id = await this.userdb.insertOne({
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            password: this.password,
            sexe: this.sexe,
            role: this._role,
            dateNaissance: this.dateNaissance,
            createdAt: this.createdAt,
            updateAt: this.updateAt,
            attempt: this.attempt,
            subscription: this.subscription,
            token: this.token,
            childsTab: this.childsTab
        });
        return this.id;
    }
    async update(update:userUpdateTypes): Promise < number > {
        const { modifiedCount } = await this.userdb.updateOne(
            { _id:  this.id },
            { $set: update }
        );
        return modifiedCount;
    }
}
