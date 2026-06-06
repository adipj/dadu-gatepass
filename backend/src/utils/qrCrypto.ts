import crypto from 'node:crypto';
import process from 'node:process';

const SECRET = process.env.SERVER_SECRET || 'super-secret-key';

export function generateQRData(pass_id: string) {
    const iat = Date.now();
    const payload = { pass_id, iat };

    const sig = crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    return { pass_id, iat, sig };
}

export function verifyQRData(pass_id: string, iat: number, sig: string): boolean {
    if (Date.now() - iat > 120000) return false;

    const expectedSig = crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify({ pass_id, iat }))
        .digest('hex');

    return sig === expectedSig;
}