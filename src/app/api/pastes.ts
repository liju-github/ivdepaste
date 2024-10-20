import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/src/lib/prisma'; 


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;
        
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'User ID is required' });
        }

        
        const pastes = await prisma.paste.findMany({
            where: { userId: userId },  
            orderBy: { createdAt: 'desc' }, 
        });

        
        res.status(200).json(pastes);
    } catch (error) {
        console.error('Error fetching pastes:', error);
        res.status(500).json({ error: 'Error fetching pastes' });
    }
}
