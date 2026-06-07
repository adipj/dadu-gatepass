import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomReq } from '../types';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';


export const requireAuth = (req: CustomReq, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded as {id: string; role: Role};
        next();
    } catch (err) {
        res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
};

export const requireRoles = (allowedRoles: string[]) => {
    return (req: CustomReq, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

export const swdApiKeyGuard = (req: CustomReq, res: Response, next: NextFunction) => {
    const apiKey = req.headers['swd-api-key'];
    if (apiKey !== process.env.SWD_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid SWD API Key' });
    }
    next();
};