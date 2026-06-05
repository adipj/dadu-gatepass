// src/utils/qrCrypto.ts
import crypto from 'node:crypto';
import process from 'node:process';

const SECRET = process.env.SERVER_SECRET || 'super-secret-key';

export function generateQRData(pass_id: string) {
    const iat = Date.now(); // Milliseconds for tight 30s window
    const payload = { pass_id, iat };

    const sig = crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    return { pass_id, iat, sig };
}

export function verifyQRData(pass_id: string, iat: number, sig: string): boolean {
    // 1. Check time expiry (30,000 ms = 30 seconds)
    if (Date.now() - iat > 30000) return false;

    // 2. Re-calculate signature to verify data wasn't tampered with
    const expectedSig = crypto
        .createHmac('sha256', SECRET)
        .update(JSON.stringify({ pass_id, iat }))
        .digest('hex');

    return sig === expectedSig;
}