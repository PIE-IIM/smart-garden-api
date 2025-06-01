import crypto from 'crypto';

export class Utils {

    generateToken(): string {
        const token = crypto.randomBytes(32).toString('hex');
        return token;
    }
}