import { Request, Response, NextFunction } from "express";
import { verifyOTP, sendMockOTP } from "../services/otp";

export const getOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;
    await sendMockOTP(phone);
    next();
};

export const confirmOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { phone, otp } = req.body;
    if (await verifyOTP(phone, otp)) {
        next();
    }
}