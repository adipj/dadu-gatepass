import prisma from '../../prisma/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { sendMockOTP } from '../services/otp';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const residentLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        if (!email.endsWith('@hyderabad.bits-pilani.ac.in')) {
            return res.status(403).json({ error: 'Must use institutional email' });
        }
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user || !user.password_hash) {
            return res.status(404).json({ error: 'Username or pwd is incorrect' });
        }
    
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });
    
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error : "Something went wrong" });
    }
};

export const visitorLogin = async (req: Request, res: Response) => {
    const phone = req.body.phone;

    try {
        const user = await prisma.user.findUnique({ where: { phone: phone } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
}

export const residentSignup = async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;
    if(role !== 'FACULTY'){
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
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
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const visitorSignup = async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { phone: phone } });
        if (user) {
            return res.status(402).json({ error: 'User already exists' });
        }
        const newUser = await prisma.user.create({
            data: { name: name, role: 'VISITOR', phone: phone }
        });
        res.json({ id: newUser.id, role: newUser.role });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const visitorOTP = async (req: Request, res: Response) => {
    const { phone } = req.body;
    try{
        const user = await prisma.user.findUnique({ where: { phone: phone } });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Sign up first' });
        }
        await sendMockOTP(phone);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
}