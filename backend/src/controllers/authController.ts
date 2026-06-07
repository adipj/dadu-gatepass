import { PrismaClient, CampusStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { sendMockOTP, verifyOTP } from '../services/otp';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const residentLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
        return res.status(403).json({ error: 'Must use institutional email' });
    }

    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user || !user.password_hash) {
        return res.status(404).json({ error: 'User not found or is a temporary visitor' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role });
};

export const visitorLogin = async (req: Request, res: Response) => {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone: phone } });
    if(!user){
        return res.status(404).json({ error: 'User not found' });
    }
    await sendMockOTP(phone);
    res.status(200).json({ message: 'OTP sent successfully' });
}

export const residentSignup = async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;

    if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
        return res.status(403).json({ error: 'Must use institutional email' });
    }

    const user = await prisma.user.findUnique({ where: { email: email } });
    if(user){
        return res.status(402).json({ error: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: { name: name, email: email, password_hash: hashed, role: role, phone: phone }
    });
    res.json({ id: newUser.id, role: newUser.role });
};

export const visitorSignup = async (req: Request, res: Response) => {
    const { name, phone } = req.body;

    const user = await prisma.user.findUnique({ where: { phone: phone } });
    if (user) {
        return res.status(402).json({ error: 'User already exists' });
    }
    const newUser = await prisma.user.create({
        data: { name: name, role: 'VISITOR', phone: phone }
    });
    res.json({ id: newUser.id, role: newUser.role });
};