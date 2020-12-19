import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";

const hash = async(password: string):Promise < string > =>{
    return await bcrypt.hash(password);
}

const comparePass = async(password: string, hash: string):Promise<boolean> =>{
    return await bcrypt.compare(password, hash);
}

export { hash, comparePass };