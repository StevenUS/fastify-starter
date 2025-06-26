import * as argon2 from 'argon2';
export async function hashPassword(password) {
    return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
        hashLength: 32,
    });
}
export async function verifyPassword(hash, password) {
    try {
        return await argon2.verify(hash, password);
    }
    catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}
//# sourceMappingURL=argon.js.map