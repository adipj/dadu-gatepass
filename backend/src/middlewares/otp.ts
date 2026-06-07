import { Request, Response, NextFunction } from "express";
import { verifyOTP } from "../services/otp";

export const confirmOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { phone, otp } = req.body;
    if (await verifyOTP(phone, otp)) {
        next();
    } 
    else {
        res.status(401).json({ error: 'Invalid or expired OTP' });
    }
}
