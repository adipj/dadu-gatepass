import prisma from '../../prisma/prisma';
import { verifyQRData } from '../utils/qrCrypto';
import { Response } from 'express';
import { CustomReq } from '../types';

export const scanQR = async (req : CustomReq, res : Response) => {
    const { pass_id, time, sig } = req.body;
    const security_id = req.user!.id;

    if (!verifyQRData(pass_id, time, sig)) {
        return res.status(401).json({ error: 'QR Invalid or Expired' });
    }

    const pass = await prisma.pass.findUnique({ where: { id: pass_id } });

    if (!pass || pass.status !== 'APPROVED' || Date.now() > pass.valid_until.getTime()) {
        await logGateAction(pass_id, security_id, 'DENIED', 'QR');
        return res.status(403).json({ error: 'Pass invalid, expired, or unapproved' });
    }

    const user = await prisma.user.findUnique({ where: { id: pass.holder_id } })
    if(!user){
        return res.status(403).json({ error: 'Something went wrong' });
    }

    const action = user.status === 'ON_CAMPUS'? 'EXIT' : 'ENTRY';
    await prisma.user.update({ 
        where: { id: pass.holder_id },
        data: { status : user.status === 'ON_CAMPUS' ? 'OFF_CAMPUS' : 'ON_CAMPUS' },
    })

    if ((user.role === 'VISITOR' && action === 'EXIT') || (user.role !== 'VISITOR' && action === 'ENTRY')){
        await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'EXPIRED' }
        })
    }

    await logGateAction(pass_id, security_id, action, 'QR');
    return res.json({ message: 'Access Granted', pass });
};

export const scanRFID = async (req : CustomReq, res : Response) => {
    const { tag_id } = req.body;
    const security_id = req.user!.id;

    const rfid = await prisma.rfidTag.findUnique({
        where: { tag_id },
        include: { 
            pass: {
                where: { status : 'APPROVED' },
                orderBy: { valid_until: 'desc' }
            }
        }
    });
    if (!rfid || rfid.valid_to < new Date()) {
        return res.status(403).json({ error: 'Access Denied' });
    }
    const pass = rfid.pass[0];
    if(!pass){
        return res.status(403).json({ error: 'No pass linked to this tag' });
    }

    const action = rfid.status === 'ON_CAMPUS' ? 'EXIT' : 'ENTRY';
    await prisma.rfidTag.update({
        where : { tag_id },
        data: { status: rfid.status === 'ON_CAMPUS' ? 'OFF_CAMPUS' : 'ON_CAMPUS' },
    })

    if(action === 'ENTRY'){
        await prisma.pass.update({
            where: { id: pass.id },
            data: { status: 'EXPIRED' }
        })
    }

    await logGateAction(pass.id, security_id, action, 'RFID');
    return res.json({ message: 'Vehicle Access Granted', pass: rfid.pass });
};

async function logGateAction(pass_id : string, checked_by : any, action : any, method : any) {
    await prisma.gateLog.create({
        data: { pass_id, checked_by, action, method }
    });
}