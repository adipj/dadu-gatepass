import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendMockOTP = async (phone: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    // Hash it so if DB is breached, OTPs aren't compromised
    const otp_hash = crypto.createHash('sha256').update(otp).digest('hex');
    const expires_at = new Date(Date.now() + 10 * 60000); // 10 mins validity

    await prisma.otpRecord.create({
        data: { phone, otp_hash, expires_at }
    });

    console.log(`\n[DEV MOCK] SMS Sent to ${phone}: Your Gatepass code is ${otp}\n`);
    return true;
};