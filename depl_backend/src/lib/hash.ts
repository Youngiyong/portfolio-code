import crypto from 'crypto-js'
import { randomBytes } from 'crypto';

const HASH_KEY  = process.env.HASH_KEY;


export function randomEmailCode(){
    return randomBytes(3).toString('hex');
}

export function hashPassword(password: string) {
    const hashed = crypto.AES.encrypt(JSON.stringify(password), HASH_KEY).toString();
    return hashed;
}


export function decryptPassword(hashPassword: string, password: string){
    const bytes = crypto.AES.decrypt(hashPassword, HASH_KEY);
    const decrypted = JSON.parse(bytes.toString(crypto.enc.Utf8));
    console.log(hashPassword, password, decrypted)
    if(password===decrypted){
        return true
    } else {
        return false
    }
}