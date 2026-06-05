import { Request, Response, NextFunction } from 'express';

export const swdApiKeyGuard = (req : Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-swd-api-key'];
    if (apiKey !== process.env.SWD_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid SWD API Key' });
    }
    next();
};