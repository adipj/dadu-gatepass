import { PassType, Role } from "@prisma/client";
import { Request } from "express";

export interface CustomReq extends Request {
    user? : {
        id:     string;
        role:   string;
    }
}

export interface PassReq extends CustomReq {
    body: {
        type:           PassType,
        valid_from:     string,
        valid_to:       string,
        holder_id:      string,
        rfid_id?:       string
    }
}

export interface BulkReq extends CustomReq {
    body: {
        passes: {
            name:       string,
            phone:      string,
            type:       PassType,
            valid_from: string,
            valid_to:   string
        }[]
    }
}