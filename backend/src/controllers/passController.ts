import { PassType } from '@prisma/client';
import { Response, Request } from 'express';
import { CustomReq, PassReq, BulkReq } from '../types'
import { generateQRData } from '../utils/qrCrypto';
import prisma from '../../prisma/prisma';

export const getPassesList = async (req: CustomReq, res: Response) => {
    const role = req.user!.role;
    let validApplicants: PassType[] = [];
    if(role === 'HOSTEL_SUPERINTENDENT') validApplicants = ['INVITED_VISITOR', 'STUDENT'];
    else if(role === 'CONFERENCE_SUPERVISOR') validApplicants = ['CONFERENCE_PARTICIPANT'];
    else if(role === 'ADMIN') validApplicants = ['VEHICLE_RFID', 'FACULTY'];
    else if(role === 'GATE_SECURITY') validApplicants = ['VISITOR']

    const passes = await prisma.pass.findMany({
        where : { 
            status: 'PENDING',
            type:  { in: validApplicants }
        },
        include : {
            applicant: {
                select : {name: true, phone: true}
            }
        }
    })

    return res.json(passes);
};

export const getMyPasses = async (req: CustomReq, res: Response) => {
    const id = req.user!.id;
    const passes = await prisma.pass.findMany({
        where: { holder_id: id },
        include: {
            approver: {
                select: { name: true }
            }
        },
        orderBy: {
            valid_from: 'desc'
        }
    });
    return res.json(passes);
};

export const approvePass = async (req : CustomReq, res : Response) => {
    const pass_id = req.params.pass_id as string;
    const approver_id = req.user!.id;

    try {
        const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
        if (!pass) return res.status(404).json({ error: 'Pass not found' });
        if (pass.status !== 'PENDING') {
            return res.status(400).json({ error: 'Pass is not pending' });
        }

        const updatedPass = await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'APPROVED', approved_by: approver_id }
        });

        res.json(updatedPass);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const rejectPass = async (req: CustomReq, res: Response) => {
    const pass_id = req.params.pass_id as string;
    const approver_id = req.user!.id;

    try {
        const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
        if (!pass) return res.status(404).json({ error: 'Pass not found' });
        if (pass.status !== 'PENDING') {
            return res.status(400).json({ error: 'Pass is not pending' });
        }

        const updatedPass = await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'REJECTED', approved_by: approver_id }
        });

        res.json(updatedPass);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createPass = async (req: PassReq, res: Response) => {
    const { type, valid_from, valid_to, rfid_id } = req.body;
    const applicant_id = req.user!.id;

    if(rfid_id){
        const rfid = await prisma.rfidTag.findUnique({ where: { id: rfid_id } });
        if(!rfid){
            return res.status(403).json({ error: "RFID doesn't exist" });
        }
        if(rfid.valid_to < new Date()){
            return res.status(403).json({ error: "RFID expired" });
        }
    }

    const newPass = await prisma.pass.create({
        data: {
            type: type,
            valid_from: new Date(valid_from),
            valid_until: new Date(valid_to),
            holder_id: applicant_id,
            applicant_id: applicant_id,
            rfid_id: rfid_id || null
        }
    });
    return res.json({pass_id: newPass.id, message: 'Pass created successfully'});
}

export const createBulkPass = async (req: BulkReq, res: Response) => {
    try {
        const { passes } = req.body;
        const applicant_id = req.user!.id;

        const databasePasses = await Promise.all(
            
            passes.map(async pass => {
                const phone = pass.phone;
                const name = pass.name;

                const user = await prisma.user.upsert({
                    where: { phone: phone },
                    create: { phone: phone, name: name, role: 'VISITOR' },
                    update: {}
                })
                const holder_id = user.id;

                return {
                    type: pass.type,
                    valid_from: new Date(pass.valid_from),
                    valid_until: new Date(pass.valid_to),
                    holder_id: holder_id,
                    applicant_id: applicant_id
                };
            })
        );
        
        await prisma.pass.createMany({
            data: databasePasses,
            skipDuplicates: true
        })
    
        return res.status(200).json({ message: "Successfullly created passes" });
    } catch (err) {
        return res.status(500).json({ error: "Something went wrong : passController/BulkPass" });
    }
}

export const createRFID = async (req: Request, res: Response) => {
    const vehicleNum = req.params.vehicleNum as string;
    const valid_from = new Date();
    const valid_to = new Date(valid_from);
    valid_to.setFullYear(valid_from.getFullYear() + 1);
    await prisma.rfidTag.upsert({
        where: {
            vehicleNum: vehicleNum
        },
        update: {
            valid_from: valid_from,
            valid_to: valid_to
        },
        create: {
            vehicleNum: vehicleNum,
            valid_from: valid_from,
            valid_to: valid_to
        }
    })
    return res.json({message: "RFID Created/Updated Successfully"});
}

export const getQR = async (req: CustomReq, res: Response) => {
    const pass_id = req.params.pass_id as string;
    const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
    if (!pass || pass.status !== 'APPROVED') {
        return res.status(403).json({ error: 'Pass not found or not approved' });
    }
    const id = req.user!.id;
    if(id !== pass.holder_id){
        return res.status(403).json({ error: 'Not authorised to view this QR' });
    }

    const QRData = await generateQRData(pass_id);
    return res.json(QRData);
};