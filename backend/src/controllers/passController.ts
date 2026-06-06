import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { CustomReq } from '../types'

const prisma = new PrismaClient();

export const approvePass = async (req : CustomReq, res : Response) => {
    const pass_id = req.params.pass_id as string;
    const approver_id = req.user!.id;

    try {
        const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
        if (!pass) return res.status(404).json({ error: 'Pass not found' });

        const updatedPass = await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'APPROVED', approved_by: approver_id }
        });

        res.json(updatedPass);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};