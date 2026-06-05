import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

const prisma = new PrismaClient();

export const approvePass = async (req : AuthRequest, res : Response) => {
    const pass_id = req.params.pass_id as string;
    const approver_id = req.user!.id;

    try {
        const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
        if (!pass) return res.status(404).json({ error: 'Pass not found' });

        const updatedPass = await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'APPROVED', approved_by: approver_id }
        });

        if (updatedPass.type === 'VEHICLE_RFID') {
            await prisma.rfidTag.create({
                data: { pass_id: updatedPass.id }
            });
        }

        res.json(updatedPass);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};