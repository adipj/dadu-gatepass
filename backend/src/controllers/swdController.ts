import { CampusStatus, PassType } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../../prisma/prisma';


export const swdCreatePass = async (req: Request, res: Response) => {
    try {
        const { studentEmail, name, type, valid_from, valid_until, phone, hashed_password } = req.body;

        if (!studentEmail.endsWith('@hyderabad.bits-pilani.ac.in')) {
            return res.status(400).json({ error: 'Invalid institutional email' });
        }

        const student = await prisma.user.upsert({
            where: { email: studentEmail },
            update: {},
            create: {
                email: studentEmail,
                name: name,  
                role: 'STUDENT',
                phone: phone,      
                password_hash: hashed_password  
            }
        });

        const pass = await prisma.pass.create({
            data: {
                type: type as PassType,           
                holder_id: student.id,
                applicant_id: student.id,
                valid_from: new Date(valid_from),
                valid_until: new Date(valid_until),
            }
        });

        return res.status(201).json({ pass_id: pass.id, message: 'Pass created successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to create pass' });
    }
};

export const swdDeletePass = async (req: Request, res: Response) => {
    try {
        const pass_id = req.params.pass_id as string;

        const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
        if (!pass) {
            return res.status(404).json({ error: 'Pass not found' });
        }
        if (pass.status === 'EXPIRED') {
            return res.status(400).json({ error: 'Pass already expired' });
        }

        await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'EXPIRED' }
        });

        return res.json({ message: 'Pass expired successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to expire pass' });
    }
};

export const swdGetPasses = async (req: Request, res: Response) => {
    try {
        const { studentEmail } = req.query;

        const student = await prisma.user.findUnique({
            where: { email: studentEmail as string }
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const passes = await prisma.pass.findMany({
            where: { holder_id: student.id },
            orderBy: { valid_from: 'desc' }
        });

        return res.json(passes);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch passes' });
    }
};