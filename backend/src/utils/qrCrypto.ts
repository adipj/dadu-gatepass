import crypto from 'node:crypto';
import process from 'node:process';

const SECRET = process.env.SERVER_SECRET || 'super-secret-key';

export function generateQRData(pass_id: string) {
    const time = Date.now();
    const payload = { pass_id, time };

    const sig = crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    return { pass_id, time, sig };
}

export function verifyQRData(pass_id: string, time: number, sig: string): boolean {
    if (Date.now() - time > 120000) return false; //2 min

    const expectedSig = crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify({ pass_id, time }))
        .digest('hex');

    return sig === expectedSig;
}