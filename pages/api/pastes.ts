// /pages/api/pastes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch pastes from Prisma
        const pastes = await prisma.paste.findMany({
            where: { userId: req.query.userId?.toString() ?? "" },
            orderBy: { createdAt: 'desc' },
        });

        // Send response back
        res.status(200).json(pastes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pastes'+error });
    }
}
