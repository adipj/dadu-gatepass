import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const sendMockOTP = async (phone: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

    const otp_hash = crypto.createHash('sha256').update(otp).digest('hex');
    const expires_at = new Date(Date.now() + 5 * 60000); //5 min validity

    await prisma.otpRecord.upsert({
        where: { phone },
        update: { otp_hash, expires_at },
        create: { phone, otp_hash, expires_at }
    });

    console.log(`\n[DEV MOCK] SMS Sent to ${phone}: Your Gatepass code is ${otp}\n`);
    return true;
};


export const verifyOTP = async (phone: string, otp: string)  => {
    const otp_hash = crypto.createHash('sha256').update(otp).digest('hex');
    const otp_record = await prisma.otpRecord.findUnique({ where: { phone: phone } });
    if (!otp_record || otp_hash != otp_record.otp_hash){
        return false;
    }
    await prisma.otpRecord.delete({ where: {phone: phone} });
    return otp_record.expires_at >= new Date();
};