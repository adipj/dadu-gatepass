import PrismaClient from '@prisma/client';
const prisma = new PrismaClient();

export const approvePass = async (req : Request, res : Response) => {
    const { pass_id } = req.params;
    const approver_id = req.user.id;

    try {
        const pass = await prisma.pass.findUnique({ where: { id: pass_id } });
        if (!pass) return res.status(404).json({ error: 'Pass not found' });

        // Recursion Check: Add RBAC routing verification here. 
        // Example: if pass.type === 'VEHICLE_RFID', req.user.role MUST be 'SWD_ADMIN'

        const updatedPass = await prisma.pass.update({
            where: { id: pass_id },
            data: { status: 'APPROVED', approved_by: approver_id }
        });

        // RFID Simulation Hook
        if (updatedPass.type === 'VEHICLE_RFID') {
            await prisma.rfidTag.create({
                data: { pass_id: updatedPass.id }
                // tag_id defaults to UUID automatically in Prisma schema
            });
        }

        res.json(updatedPass);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};