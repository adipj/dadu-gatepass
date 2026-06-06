// src/controllers/gateController.ts
import { PrismaClient } from '@prisma/client';
import { verifyQRData } from '../utils/qrCrypto';
import { Response } from 'express';
import { CustomReq } from '../types';

const prisma = new PrismaClient();

export const scanQR = async (req : CustomReq, res : Response) => {
    const { pass_id, iat, sig } = req.body;
    const security_id = req.user!.id;

    if (!verifyQRData(pass_id, iat, sig)) {
        return res.status(401).json({ error: 'QR Invalid or Expired (30s timeout)' });
    }

    const pass = await prisma.pass.findUnique({ where: { id: pass_id } });

    if (!pass || pass.status !== 'APPROVED' || Date.now() > pass.valid_until.getTime()) {
        await logGateAction(pass_id, security_id, 'DENIED', 'QR');
        return res.status(403).json({ error: 'Pass invalid, expired, or unapproved' });
    }

    await logGateAction(pass_id, security_id, 'ENTRY', 'QR');
    res.json({ message: 'Access Granted', pass });
};

export const scanRFID = async (req : any, res : any) => {
    const { tag_id } = req.body;
    const security_id = req.user.id;

    const rfid = await prisma.rfidTag.findUnique({
        where: { tag_id },
        include: { pass: true }
    });

    if (!rfid || rfid.pass.status !== 'APPROVED' || Date.now() > rfid.pass.valid_until.getTime()) {
        if (rfid) await logGateAction(rfid.pass_id, security_id, 'DENIED', 'RFID');
        return res.status(403).json({ error: 'Access Denied' });
    }

    await logGateAction(rfid.pass_id, security_id, 'ENTRY', 'RFID');
    res.json({ message: 'Vehicle Access Granted', pass: rfid.pass });
};

async function logGateAction(pass_id : string, checked_by : any, action : any, method : any) {
    await prisma.gateLog.create({
        data: { pass_id, checked_by, action, method }
    });
}